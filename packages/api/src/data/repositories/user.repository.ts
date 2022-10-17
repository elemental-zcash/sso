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
  totpSecret: string;
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
    this.totpSecret = data.totpSecret;
    this.pswd = data.pswd;
    this.joinedOn = data.joinedOn;
    this.roles = data.roles;
    this.dbIndex = data.id;
  }
  static fromRedisEntity(data: FormattedUserType) {
    if (data) {
      const { dbIndex, id, ..._data } = data;
      return new this(data.id, { id: dbIndex, ..._data});
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
      log.debug('findById: ', { userRes });
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>(user, db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);
    log.debug({ canSee });

    return canSee ? user : null;
  }
  async findByUsername(viewer: Viewer, username: string) {
    let user = UserEntity.fromRedisEntity(await cacheSearchEntity<User, FormattedUserType>({ username }, db.users.model, this.redisRepo));

    if (!user) {
      const userRes = await db.users.findByUsername(username);
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>(user, db.users.model, this.redisRepo);
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
      user = new UserEntity(userRes.publicId, userRes);
      await cacheSaveEntity<User, FormattedUserType>(user, db.users.model, this.redisRepo);
    }

    if (!user) {
      return null;
    }
    const canSee = checkCanSee(viewer, user);

    return canSee ? user : null;
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

    await cacheSaveEntity<User, FormattedUserType>(user, db.users.model, this.redisRepo);

    return user;
  }
  async deleteById(publicId: string) {

  }
  async update() {

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


export default UserRepository;
