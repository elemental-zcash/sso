import { OAuthAuthorizationCodeType, OAuthAuthorizationCode, UserType, OAuthClientType } from '../../models';
import { cacheSaveEntity, cacheSearchEntity, ModelToType } from '../../utils';
import { db } from '../pg';

import Repository from './repository';


type AuthCodeType = Omit<OAuthAuthorizationCodeType, 'id' | 'userId' | 'clientId'> & {
  id: undefined,
  dbIndex: number,
  clientId: string,
  userId: string,
};

const checkAuthCodeFound = (authCode) => {
  if (!authCode) {
    throw new Error('Auth code not found');
  }
  return authCode;
};

const formatAuthCode = (authCode: OAuthAuthorizationCodeType & { user: UserType, client: OAuthClientType }): AuthCodeType => {
  if (!authCode) {
    throw new Error('Auth code not found');
  }
  const { id, userId: __userId, ..._authCode } = authCode;

  return {
    ..._authCode,
    id: undefined,
    dbIndex: id,
    userId: authCode.user.publicId,
    clientId: authCode.client.clientId,
  };
}

class AuthCodeRepository extends Repository {
  __type = 'authorizationCodes';

  async findByAuthCode(authorizationCode: string) {
    const cachedAuthCode = await cacheSearchEntity<OAuthAuthorizationCode>({ authorizationCode }, db.authorizationCodes.model, this.redisRepo);

    if (cachedAuthCode) {
      console.log({ cachedAuthCode });
      return cachedAuthCode;
    }
    const authCodeRes = await db.authorizationCodes.findByAuthorizationCode(authorizationCode);
    console.log({ authCodeRes })
    if (!authCodeRes) {
      return null;
    }
    // const user = await db.users.findByIndex(authCodeRes.userId);
    const authCode = formatAuthCode(checkAuthCodeFound(authCodeRes));
    await cacheSaveEntity<OAuthAuthorizationCode, AuthCodeType>(authCode, db.authorizationCodes.model, this.redisRepo);

    return authCode;
  }
  async findByUser(publicId: string) {
    const cachedAuthCode = await cacheSearchEntity<OAuthAuthorizationCode>({ userId: publicId }, db.authorizationCodes.model, this.redisRepo);

    if (cachedAuthCode) {
      return cachedAuthCode;
    }
    // const user = await db.users.findById(publicId);
    // if (!user.id) {
    //   return;
    // }
    const authCode = formatAuthCode(checkAuthCodeFound(await db.authorizationCodes.findByUserId(publicId)));
    await cacheSaveEntity<OAuthAuthorizationCode, AuthCodeType>(authCode, db.authorizationCodes.model, this.redisRepo);

    return authCode;
  }

  async create(data) {
    // const res = await db.authorizationCodes.addCode(data);
    if (!await db.authorizationCodes.addCode(data)) {
      return null;
    }
    const authCode = formatAuthCode({ ...data, user: { publicId: data.userId }, client: { clientId: data.clientId }});

    if (!authCode) {
      return null;
    }

    await cacheSaveEntity<OAuthAuthorizationCode, AuthCodeType>(authCode, db.authorizationCodes.model, this.redisRepo);

    return authCode;
  }
  async deleteById(publicId: string) {

  }
  async deleteByCode(authCode: string): Promise<boolean> {
    return Boolean(await db.authorizationCodes.removeByAuthorizationCode(authCode));
    // TODO: delete cache
    // await cacheDeleteEntity
  }
  async update() {

  }
}



export default AuthCodeRepository;
