import log from 'loglevel';
import { OAuthToken, OAuthTokenType } from '../../models';
import { cacheSaveEntity, cacheSearchEntity, ModelToType } from '../../utils';
import { db } from '../pg';

import Repository from './repository';


type FormattedTokenType = Omit<OAuthTokenType, 'id' | 'userId' | 'clientId'> & {
  id?: string | number,
  userId: string,
  clientId: string,
  dbIndex: number,
};

const formatToken = (token: OAuthTokenType): FormattedTokenType => {
  if (!token) {
    return null;
  }
  const { id, ..._token } = token;

  return {
    ..._token,
    id: undefined,
    userId: (_token.userId as unknown) as string,
    clientId: (_token.clientId as unknown) as string,
    dbIndex: id,
  };
}

class TokenRepository extends Repository {
  __type = 'tokens';

  async findByAccessToken(accessToken: string): Promise<FormattedTokenType> {
    const cachedUser = await cacheSearchEntity<OAuthToken, FormattedTokenType>({ accessToken }, db.tokens.model, this.redisRepo);

    if (cachedUser) {
      return cachedUser;
    }
    const token = formatToken(await db.tokens.findByAccessToken(accessToken));
    if (!token) {
      return null;
    }
    await cacheSaveEntity<OAuthToken, FormattedTokenType>(token, db.tokens.model, this.redisRepo);

    return token;
  }
  async findByRefreshToken(refreshToken: string): Promise<FormattedTokenType | null> {
    const cachedUser = await cacheSearchEntity<OAuthToken, FormattedTokenType>({ refreshToken }, db.tokens.model, this.redisRepo);

    if (cachedUser) {
      return cachedUser;
    }
    const token = formatToken(await db.tokens.findByRefreshToken(refreshToken));
    if (!token) {
      return null;
    }
    await cacheSaveEntity<OAuthToken, FormattedTokenType>(token, db.tokens.model, this.redisRepo);

    return token;
  }

  async create(data) {

    const resSql = await db.tokens.addToken(data);
    const res = await db.tokens.findByAccessToken(resSql.access_token);
    log.debug('token.create(...): ', { res });
    const token = formatToken(res);

    if (!token) {
      return null;
    }
    log.debug('formattedToken: ', { token });

    await cacheSaveEntity<OAuthToken, FormattedTokenType>(token, db.tokens.model, this.redisRepo);

    return token;
  }
  async deleteById(publicId: string) {

  }
  async deleteByRefreshToken(refreshToken: string): Promise<boolean> {
    return Boolean(await db.tokens.removeByRefreshToken(refreshToken));
    // TODO: delete cache
    // await cacheDeleteEntity
  }
  async update() {

  }
}



export default TokenRepository;
