import { TextField } from 'elemental-orm/lib/models/fields/TextField';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';


import { User } from '../../models';
import { jsonToSql } from '../../utils/sql';




// import {User} from '../models';
import { users as sql, UserSQL } from '../sql';

interface TypeMapper {
  AutoField: 'string'
}

// type UserType = {
//   [Property in keyof User as `${Property}`]: User[Property];
// };
function process<T extends string | null>(
  text: T
): T extends string ? string : null {
  return null;
}


type IfEquals<T, U, Y=unknown, N=never> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? Y : N;

type ToSnakeCase<Type> = {
  [Property in keyof Type]: Type[Property] extends { __type: 'string' } ? string : boolean;
}

type UserType = ToSnakeCase<User>;

// Cool ColumnSet util:
// const onConflict = ' ON CONFLICT(first, second) DO UPDATE SET ' +
//     cs.assignColumns({from: 'EXCLUDED', skip: ['first', 'second']});
// const upsert = pgp.helpers.insert(data, cs) + onConflict; // generates upsert


export class UsersRepository {
  cs: ColumnSet<unknown>
  model: User
  constructor(private db: IDatabase<any>, private pg: IMain) {
    this.db = db;
    this.pg = pg;
    this.model = new User(db, pg);
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

  // Adds a new user, and returns the new object;
  async add({ uuid, username, email, unverifiedEmail, isVerifiedEmail, pswd, name }: {
    uuid: string,
    username: string,
    email?: string,
    unverifiedEmail?: string,
    isVerifiedEmail: boolean,
    pswd: string,
    name: string,
  }): Promise<User> {
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
    return this.db.result('DELETE FROM users WHERE id = $1', +id, (r: IResult) => r.rowCount);
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
  async all(): Promise<UserSQL[]> {
   return this.model.objects.all();
  }

  // Returns the total number of users;
  async total(): Promise<number> {
    return this.model.objects.total();
  }
}