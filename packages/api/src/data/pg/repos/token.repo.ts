import { SQLRepository } from 'elemental-orm';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { flattenSqlValues } from 'elemental-orm/lib/utils/sql';
import log from 'loglevel';

import { oauthTokens as sql } from '../sql';

import { OAuthToken, OAuthTokenSQL, OAuthTokenType } from '../../../models';

function transformResult(result) {
  log.debug('token transformResult: ', { result });
  const { oauth_tokens, users, oauth_clients } = result || {};
  if (oauth_tokens) {
    return {
      ...oauth_tokens,
      clientId: oauth_clients?.clientId,
      userId: users?.publicId,
      user: users,
    };
  }
  return null;
}

export class TokensRepository extends SQLRepository<OAuthToken> {
  cs: ColumnSet<unknown>
  model: OAuthToken = new OAuthToken(this.db, this.pg);
  transformResult = transformResult;

  async removeByAccessToken(accessToken: string): Promise<number> {
    return this.remove({ access_token: accessToken });
  }
  async removeByRefreshToken(refreshToken: string): Promise<number> {
    return this.remove({ refresh_token: refreshToken });
  }
  async findByRefreshToken(refreshToken: string): Promise<OAuthTokenType> {
    return transformResult(await this.find({ refreshToken }));
  }
  async findByAccessToken(accessToken: string): Promise<OAuthTokenType> {
    log.debug({ accessToken });
    // log.debug({ res: await this.db.oneOrNone(sql.find, ['access_token', accessToken]) });

    return transformResult(await this.find({ accessToken }));
  }
  async addToken({
    accessToken, refreshToken, accessTokenExpiresOn, refreshTokenExpiresOn, clientId, userId,
  }: Omit<OAuthTokenType, 'userId' | 'clientId'> & { userId: string, clientId: string }): Promise<OAuthTokenSQL> {
    return await this.db.oneOrNone(sql.add, { accessToken, refreshToken, accessTokenExpiresOn, refreshTokenExpiresOn, clientId, userId, scopes: null });
    // log.debug('addCode: ', { res });
    // return transformResult(flattenSqlValues(res)[0]);
  }
}