/**
 * DEPRECATED FOR NOW
 */
// import { db } from "../data";
import { nanoid } from 'nanoid';

import { db, pg, redisClient } from '../data';
import { User } from '../models';
import { cacheGet, cacheSet, objNotNull } from '../utils';
import { cacheGetOrSet } from '../utils/data';

const formatUser = (obj) => {
  if (!objNotNull(obj?.users)) {
    return null;
  }
  const { users: user } = obj;

  return {
    ...user,
    id: user.uuid,
    dbIndex: user.id,
  };
};


const getUser = async (args: { id?: string, username?: string }) => {
  const { username } = args;
  let id = `${args.id}`;

  if (username) {
    id = await redisClient.get(`usernameById:${username}`);
    if (!id) {
      id = formatUser(await db.users.findByUsername(username)).uuid;
      await redisClient.set(`usernameByClient:${id}`, username);
    }
  }
  if (!id) {
    return;
  }

  let user = await cacheGet(`users:${id}`);

  if (!cacheGet) {
    user = formatUser(await db.users.findById(id));
    await cacheSet(`users:${id}`, user);
  }

  return user;
};

export const generateId = async (): Promise<string> => {
  let id = nanoid();
  let existingUser;
  try {
    existingUser = formatUser(await db.users.findById(id));
  } catch (err) {
    if (err.message === 'User not found') {
      return id;
    }
  }

  if (existingUser) {
    id = await generateId();
  } else {
    return id;
  }

  throw new Error('Failed to generate unique ID');
}

const createUser = async (input: {
  username: string, pswd: string, email?: string, unverifiedEmail?: string, name: string,
}) => {
  const { username, pswd, email, unverifiedEmail, name } = input;

  // const id = nanoid();
  const id = await generateId();

  try { // @ts-ignore
    await db.users.add({ uuid: id, username, pswd, unverifiedEmail: unverifiedEmail, email, name, isVerifiedEmail: false });
    await cacheSet(`users:${id}`, {
      id,
      username,
      pswd,
      unverifiedEmail,
      email,
      name,
      isVerifiedEmail: false,
    });
    await redisClient.set(`usernameByClient:${id}`, username);
  } catch (err) {
    console.log({ err });
    throw Error(err);
  }
}

const updateUser = (args: { id?: string, input }) => {
  
};

const deleteUser = () => {

};

export default {
  get: {
    controller: getUser,
    // validation: {
    //   params: Joi.object({
    //     id: Joi.number().integer().min(1).max(9999999).required(),
    //   }),
    // }
  },
  create: {
    controller: createUser,
  },
  update: {
    controller: updateUser,
  },
  delete: {
    controller: deleteUser,
  },
  // More powerful validation than GraphQL schema
};