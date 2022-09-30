import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';


import { OAuthAuthorizationCode, User, UserType } from '../../models';
import { jsonToSql } from '../../utils/sql';




// import {User} from '../models';
import { oauthAuthorizationCodes as sql } from '../sql';



// Cool ColumnSet util:
// const onConflict = ' ON CONFLICT(first, second) DO UPDATE SET ' +
//     cs.assignColumns({from: 'EXCLUDED', skip: ['first', 'second']});
// const upsert = pgp.helpers.insert(data, cs) + onConflict; // generates upsert


export class AuthCodeRepository {
  cs: ColumnSet<unknown>
  model: OAuthAuthorizationCode
  constructor(private db: IDatabase<any>, private pg: IMain) {
    this.db = db;
    this.pg = pg;
    this.model = new OAuthAuthorizationCode(db, pg);
    this.cs = new pg.helpers.ColumnSet(['a', 'b'], { table: 'c' });
  }

  async create(): Promise<null> {
      return this.db.none(sql.create);
  }

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

  // Adds a new user, and returns the new object;
  async add({ uuid, username, email, unverifiedEmail, isVerifiedEmail, pswd, name }: UserType): Promise<User> {
    return this.model.objects.create({ uuid, username, email, unverifiedEmail, isVerifiedEmail, pswd, name });
    // return this.db.one(sql.add, { uuid, username, email, pswd });
  }

  async bulkAdd(items): Promise<unknown> {
    return this.model.objects.bulkCreate(items);
    // const { db, pg, cs } = this;
    // const data = items.map(jsonToSql);
    // const query = pg.helpers.insert(data, cs);

    // this.model.ob

    // return await db.none(query);
  }

  // Tries to delete a user by id, and returns the number of records deleted;
  async remove(id: number): Promise<number> {
    // return this.model.objects.delete({ uuid: id });
    return this.db.result('DELETE FROM oauth_authorization_code WHERE id = $1', +id, (r: IResult) => r.rowCount);
  }

  // Tries to find a user from id;
  async findById(id: string): Promise<User | null> {
    return this.model.objects.get({ uuid: id });
    // return users;
    // return this.db.oneOrNone('SELECT * FROM users WHERE id = $1', +id);
  }

  // Tries to find a user from name;
  async findByName(name: string): Promise<User | null> {
    return this.model.objects.get({ username: name });
  }

  // Returns all user records;
  async all(): Promise<unknown[]> {
   return this.model.objects.all();
  }

  // Returns the total number of users;
  async total(): Promise<number> {
    return this.model.objects.total();
  }
}