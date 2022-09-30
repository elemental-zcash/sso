import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';


import { OAuthToken, OAuthTokenType } from '../../models';
import { cacheDelete, cacheGet, cacheSet } from '../../utils';
import { jsonToSql } from '../../utils/sql';

import * as cache from '../cache';



// import {User} from '../models';
import { users as sql, UserSQL } from '../sql';

type TokenType = {
  // TODO:
}

// Cool ColumnSet util:
// const onConflict = ' ON CONFLICT(first, second) DO UPDATE SET ' +
//     cs.assignColumns({from: 'EXCLUDED', skip: ['first', 'second']});
// const upsert = pgp.helpers.insert(data, cs) + onConflict; // generates upsert


export class TokensRepository {
  cs: ColumnSet<unknown>
  model: OAuthToken
  constructor(private db: IDatabase<any>, private pg: IMain) {
    this.db = db;
    this.pg = pg;
    this.model = new OAuthToken(db, pg);
    this.cs = new pg.helpers.ColumnSet(['a', 'b'], { table: 'c' });
  }

  // Creates the table;
  // async create(): Promise<null> {
  //     return this.db.none(sql.create);
  // }

  // // Initializes the table with some user records, and return their id-s;
  // async init(): Promise<number[]> {
  //   return this.db.map(sql.init, [], (row: { id: number }) => row.id);
  // }

  // Drops the table;
  async drop(): Promise<null> {
    return this.db.none(sql.drop);
  }

  // Removes all records from the table;
  async empty(): Promise<null> {
    return this.db.none(sql.empty);
  }


  // Adds a new token, and returns the new object;
  async add({ 
    accessToken,
    accessTokenExpiresOn,
    clientId,
    refreshToken,
    refreshTokenExpiresOn,
    userId,
   }: OAuthTokenType): Promise<OAuthTokenType> {
    return this.model.objects.create({
      accessToken,
      accessTokenExpiresOn,
      clientId,
      refreshToken,
      refreshTokenExpiresOn,
      userId,
    });
  }

  async bulkAdd(items): Promise<unknown> {
    return this.model.objects.bulkCreate(items);
  }

  async remove(id: number): Promise<number> {
    // return this.model.objects.delete({ uuid: id });
    return this.db.result('DELETE FROM oauth_tokens WHERE id = $1', +id, (r: IResult) => r.rowCount);
  }

  async deleteByRefreshToken(refreshToken: OAuthTokenType['refreshToken']) {
    const accessToken = await cacheGet(`tokenByRefreshToken:${refreshToken}`);
    if (accessToken) {
      await cacheDelete(`tokens:${accessToken}`);
    }

    return this.db.result('DELETE FROM oauth_tokens WHERE refresh_token = $1', refreshToken, (r: IResult) => r.rowCount);
  }

  // async findById(id: string): Promise<any | null> {
  //   return this.model.objects.get({ uuid: id });
  // }

  async findByToken(accessToken: OAuthTokenType['accessToken']): Promise<any | null> {
    let token = await cacheGet(`tokens:${accessToken}`);
    if (!token) {
      const { tokens, users } = await this.model.objects.get({ accessToken });
      token = {
        ...tokens,
        userId: users.uuid,
      };
      await cacheSet(`tokens:${accessToken}`, token);
    }
    return this.model.objects.get({ accessToken });
  }
  async findByRefreshToken(refreshToken: OAuthTokenType['refreshToken']): Promise<any | null> {
    let token = await cache.tokens.getTokenByRefreshToken(refreshToken);

    if (!token) {
      const { tokens, users } = await this.model.objects.get({ refreshToken });
      accessToken = tokens.accessToken;
      
      const token = { ...tokens, userId: users.uuid }
      if (accessToken && !(await cacheGet(`tokens:${accessToken}`))) {
        await cacheSet(`tokens:${accessToken}`, { ...tokens, userId: users.id });
      }
    }

    if (accessToken && typeof accessToken === 'string') {
      return this.findByToken(accessToken);
    }

    return null;
  }



  // Returns all user records;
  async all(): Promise<OAuthTokenType[]> {
   return this.model.objects.all();
  }

  // Returns the total number of users;
  async total(): Promise<number> {
    return this.model.objects.total();
  }
}