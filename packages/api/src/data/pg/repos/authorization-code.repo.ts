import { SQLRepository } from 'elemental-orm';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { flattenSqlValues } from 'elemental-orm/lib/utils/sql';
import log from 'loglevel';

import { oauthAuthorizationCodes as sql } from '../sql';
import { OAuthAuthorizationCode, OAuthAuthorizationCodeType } from '../../../models';

function transformResult(result) {
  log.debug({ result });
  const { oauth_authorization_codes, users, oauth_clients } = result || {};
  if (oauth_authorization_codes) {
    return {
      ...oauth_authorization_codes,
      user: users,
      client: oauth_clients,
      userId: users.publicId,
      clientId: oauth_clients.clientId,
    };
  }
  return null;
}

export class AuthorizationCodesRepository extends SQLRepository<OAuthAuthorizationCode> {
  cs: ColumnSet<unknown>
  model: OAuthAuthorizationCode = new OAuthAuthorizationCode(this.db, this.pg);
  transformResult = transformResult;

  async removeByAuthorizationCode(authorizationCode: string): Promise<number> {
    return this.remove({ authorizationCode });
  }
  async findByAuthorizationCode(authorizationCode: string): Promise<OAuthAuthorizationCodeType> {
    log.debug({ authorizationCode });
    log.debug({ res: await this.db.oneOrNone(sql.find, ['authorization_code', authorizationCode]) });
    try {
      let res = await this.find({ authorizationCode });
      log.debug('codesRes: ', { res });
      return transformResult(res);
    } catch (err) {
        console.log(err);
      }
      return null;
  }
  async findByUserId(userId: string): Promise<OAuthAuthorizationCodeType> {
    return transformResult(flattenSqlValues(await this.db.oneOrNone(sql.findByUserId, [userId]))[0]);
    // return transformResult(await this.find({ userId: dbIndex }));
  }
  async addCode({
    authorizationCode, expiresAt, redirectUri, clientId, userId
  }: Omit<OAuthAuthorizationCodeType, 'userId' | 'clientId'> & { userId: string, clientId: string }) {
    let res;
    try {
      res = await this.db.oneOrNone(sql.add, {authorizationCode, expiresAt, redirectUri, clientId, userId });
    } catch (err) {
      console.log(err);
      return;
    }
    console.log('addCode: ', { res });
    return flattenSqlValues(res)[0];
  }
}