import { SQLRepository } from 'elemental-orm';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';
import { Schema, Entity, Repository } from 'redis-om';

import { User, UserType, UserTypeSQL } from '../../../models';
import { getRedisSchemaFromModel, ModelToSnakeCase, ModelToType } from '../../../utils';

import { users as sql } from '../../pg/sql';

// Cool ColumnSet util:
// const onConflict = ' ON CONFLICT(first, second) DO UPDATE SET ' +
//     cs.assignColumns({from: 'EXCLUDED', skip: ['first', 'second']});
// const upsert = pgp.helpers.insert(data, cs) + onConflict; // generates upsert


function transformResult(result) {
  const { users } = result || {};
  if (users) {
    return users;
  }
  return null;
}


export class UsersRepository extends SQLRepository<User, typeof sql> {
  cs: ColumnSet<unknown>
  model: User = new User(this.db, this.pg);
  transformResult = transformResult;


  async removeById(publicId: string): Promise<number> {
    return this.remove({ publicId });
  }
  async findById(publicId: string): Promise<UserType> {
    return transformResult(await this.find({ public_id: publicId }));
  }
  async findByUsername(username: string): Promise<UserType> {
    return transformResult(await this.find({ username }));
  }
  async findByEmail(email: string): Promise<UserType> {
    return transformResult(await this.find({ email }));
  }
  async addUser({
    // accessToken, refreshToken, accessTokenExpiresOn, refreshTokenExpiresOn, clientId, userId,
    publicId, name, email, totpSecret, unverifiedEmail, isVerifiedEmail, username, roles, pswd
  }: UserType): Promise<UserTypeSQL> {
    return await this.db.oneOrNone(sql.add, { publicId, name, email, totpSecret, unverifiedEmail, isVerifiedEmail, username, roles, pswd });
    // log.debug('addCode: ', { res });
    // return transformResult(flattenSqlValues(res)[0]);
  }
}