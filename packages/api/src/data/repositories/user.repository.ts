import log from 'loglevel';
import { User, UserType } from '../../models';
import { cacheSaveEntity, cacheSearchEntity, ModelToType } from '../../utils';
import { db } from '../pg';
import { Viewer } from '../../types';

import Repository from './repository';


type FormattedUserType = Omit<UserType, 'id'> & {
  id: string,
  dbIndex: number,
};

// Already exists
/*
{
  detail: 'Key ... already exists.'
  routine: '_bt_check_unique
}
*/

// const formatUser = (user: UserType): FormattedUserType | null => {
//   if (!user) {
//     return null
//   }
//   const { id, ..._user } = user;

//   return {
//     ..._user,
//     id: user.publicId,
//     dbIndex: id,
//   };
// }

class UserEntity implements FormattedUserType {
  id: string;
  publicId: string;
  username: string;
  name: string;
  email: string;
  unverifiedEmail: string;
  totp: string;
  emailConfirmation: string;
  bio: string;
  socials: string;
  zcashaddress: string;
  passwordReset: string;
  isVerifiedEmail: boolean;
  pswd: string;
  joinedOn: Date;
  roles: string[];
  dbIndex: number;

  constructor(id: string, data: UserType) {
    this.id = id;
    this.publicId = data.publicId;
    this.username = data.username;
    this.name = data.name;
    this.email = data.email;
    this.unverifiedEmail = data.unverifiedEmail;
    this.isVerifiedEmail = data.isVerifiedEmail;
    this.totp = data.totp;
    this.emailConfirmation = data.emailConfirmation;
    this.passwordReset = data.passwordReset;
    this.bio = data.bio;
    this.socials = data.socials;
    this.zcashaddress = data.zcashaddress;
    this.pswd = data.pswd;
    this.joinedOn = data.joinedOn;
    this.roles = data.roles;
    this.dbIndex = data.id;
  }
  toRedisEntity() {
    // const { fromRedisEntity, toRedisEntity, ...data } = this;
    const { ...data } = this;

    console.log({ website: (data?.socials as any)?.website })
    return {
      ...data,
      socials: null, //JSON.stringify(data.socials),
      website: (data?.socials as any)?.website,
      twitter: (data?.socials as any)?.twitter,
      youtube: (data?.socials as any)?.youtube,
      instagram: (data?.socials as any)?.instagram,
      emailConfirmation: null,
      emailConfirmationToken: (data?.emailConfirmation as any)?.token,
      emailConfirmationExpiresAt: (data?.emailConfirmation as any)?.expiresAt,
    }
  }
  static fromRedisEntity(data: FormattedUserType & { emailConfirmationToken?: string, emailConfirmationExpiresAt?: string }) {
    if (data) {
      const { dbIndex, id, ..._data } = data;
      return new this(data.id, {
        id: dbIndex,
        emailConfirmation: { token: data.emailConfirmationToken, expiresAt: data.emailConfirmationExpiresAt },
        // socials: { token: data.emailConfirmationToken, expiresAt: data.emailConfirmationExpiresAt },
        // passwordReset: { token: data.emailConfirmationToken, expiresAt: data.emailConfirmationExpiresAt },
        ..._data
      });
    }

    return null;
  }
}

function checkCanSeeAll(viewer: Viewer) {
  return viewer.roles?.includes('admin');
}


class UserRepository extends Repository {
  __type = 'users';

  async all(viewer: Viewer) {
    const canSee = checkCanSeeAll(viewer);

    if (!canSee) {
      return null;
    }

    return null;
  }
  async findById(viewer: Viewer, publicId: string): Promise<FormattedUserType | null> {
    let user = UserEntity.fromRedisEntity(await cacheSearchEntity<User, FormattedUserType>({ publicId }, db.users.model, this.redisRepo));
    log.debug('findById: ', { user });
    
    if (!user) {
      const userRes = await db.users.findById(publicId);
      if (!userRes) {
        return null;
      }
      log.debug('findById: ', { userRes });
      user = new UserEntity(userRes.publicId, userRes);
      // FIXME: TODO: Check before using a cache ORM library whether it supports JSON nesting yet... :'( - giving up on debugging at 6am...
      // await cacheSaveEntity<User, FormattedUserType>((user.toRedisEntity as any), db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);
    log.debug({ canSee });
    // FIXME: Integrate into permissioning layer
    if ((viewer.isPublic || viewer.userId !== user.publicId) && !viewer.isAuthenticating) {
      const { id, publicId, name, username, socials, bio, zcashaddress } = user;

      return {
        id, publicId, name, username, socials, bio, zcashaddress,
        email: null, totp: null, unverifiedEmail: null, isVerifiedEmail: null,
        pswd: null, joinedOn: null, roles: null, emailConfirmation: null, passwordReset: null, dbIndex: null,
      };
    }

    return canSee ? user : null;
  }
  async findByUsername(viewer: Viewer, username: string) {
    let user = UserEntity.fromRedisEntity(await cacheSearchEntity<User, FormattedUserType>({ username }, db.users.model, this.redisRepo));

    if (!user) {
      const userRes = await db.users.findByUsername(username);
      if (!userRes) {
        return null;
      }
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>((user.toRedisEntity as any), db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);

    return canSee ? user : null;
  }
  async findByEmail(viewer: Viewer, email: string) {
    let user = UserEntity.fromRedisEntity(await cacheSearchEntity<User, FormattedUserType>({ email }, db.users.model, this.redisRepo));

    if (!user) {
      const userRes = await db.users.findByEmail(email);
      if (!userRes) {
        return null;
      }
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>((user.toRedisEntity as any), db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);

    return canSee ? user : null;
  }
  async findByUnverifiedEmail(viewer: Viewer, email: string) {
    let user = UserEntity.fromRedisEntity(await cacheSearchEntity<User, FormattedUserType>({ unverifiedEmail: email }, db.users.model, this.redisRepo));

    if (!user) {
      const userRes = await db.users.findByUnverifiedEmail(email);
      if (!userRes) {
        return null;
      }
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>((user.toRedisEntity as any), db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);

    return canSee ? user : null;
  }
  async update(viewer: Viewer, id: string, data: Partial<UserType>): Promise<FormattedUserType | null> {
    const canUpdate = checkCanUpdate(viewer, { ...data, publicId: id } as UserType); // FIXME: Make this nicer
    log.debug('update: ', { canUpdate });
    if (!canUpdate) {
      return null;
    }

    const existingUser = await this.findById(viewer, id);
    log.debug('update: ', { existingUser });


    // FIXME: THIS IS SUPER DANGEROUS, CAN WIPE DATA FROM DB WITH A BAD (e.g. public or system) VIEWER
    const res = await db.users.update({
      ...existingUser,
      ...data,
    });
    const updatedUser = await this.findById(viewer, id);
    let userToSaveToCache = new UserEntity(id, (updatedUser as any));

    // FIXME: TODO: Check before using a cache ORM library whether it supports JSON nesting yet... :((((( - giving up on debugging at 6am...
    // await cacheSaveEntity<User, FormattedUserType>(userToSaveToCache.toRedisEntity(), db.users.model, this.redisRepo);
    log.debug('user.update: ', { res });

    return res as any;
  }
  async create(viewer: Viewer, data: UserType): Promise<FormattedUserType | null> {
    const canCreate = checkCanCreate(viewer, data);
    if (!canCreate) {
      throw new Error('Not authorized to create users');
    }
    const res = await db.users.addUser(data);
    if (!res?.public_id) {
      return null;
    }
    const userRes = await db.users.findById(res.public_id);
    // console.log({ res });
    const user = new UserEntity(res.public_id, userRes);

    if (!user) {
      return null;
    }

    await cacheSaveEntity<User, FormattedUserType>((user.toRedisEntity as any), db.users.model, this.redisRepo);

    return user;
  }
  async deleteById(publicId: string) {

  }
}

// type UnknownObject =  { [key: string]: unknown };


const checkCanSee = (viewer: Viewer, data: UserEntity) => {
  if (viewer.isAuthenticating) {
    return true;
  }
  return viewer.userId === data.publicId;
}

const checkCanCreate = (viewer: Viewer, data: UserType) => {
  return Boolean(viewer.isPublic && data.publicId);
}

const checkCanUpdate = (viewer: Viewer, data: UserType) => {
  if (viewer.isAuthenticating) {
    return true;
  }
  return viewer.userId === data.publicId;
}


export default UserRepository;
