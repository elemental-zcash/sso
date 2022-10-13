import { SQLRepository } from 'elemental-orm';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';

import { oauthClients as sql } from '../sql';
import { OAuthClient, OAuthClientType } from '../../../models';

function transformResult(result) {
  // log.debug({ result });
  const { oauth_clients } = result || {};
  if (oauth_clients) {
    return {
      ...oauth_clients,
      // user: users,
    };
  }
  return null;
}

export class ClientsRepository extends SQLRepository<OAuthClient> {
  cs: ColumnSet<unknown>
  model: OAuthClient = new OAuthClient(this.db, this.pg);
  transformResult = transformResult;

  async removeById(clientId: string): Promise<number> {
    return this.remove({ clientId });
  }
  // async findByAuthorizationCode(authorizationCode: string): Promise<OAuthClientType> {
  //   return transformResult(this.find({ authorizationCode }));
  // }
  async findById(clientId: string): Promise<OAuthClientType> {
    return transformResult(await this.find({ clientId }));
  }
  // async addClient({
  //   authorizationCode, expiresAt, redirectUri, clientId, userId
  // }: Omit<OAuthClientType, 'userId' | 'clientId'> & { userId: string, clientId: string }) {
  //   return flattenSqlValues(await this.db.oneOrNone(sql.add, {authorizationCode, expiresAt, redirectUri, clientId, userId }));
  // }
}