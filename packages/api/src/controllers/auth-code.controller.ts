/**
 * DEPRECATED FOR NOW
 */
// import { db } from "../data";
import { nanoid } from 'nanoid';

import { db, pg, redisClient } from '../data';
import { User } from '../models';
import { cacheGet, cacheSet, objNotNull } from '../utils';
import { cacheGetOrSet } from '../utils/data';

const formatRes = (obj) => {
  if (!objNotNull(obj?.users)) {
    return null;
  }
  const { oauthAuthorizationCodes, users: user } = obj;

  return {
    ...oauthAuthorizationCodes,
    id: user.uuid,
    dbIndex: user.id,
  };
};


// const getUser = async (args: { id?: string, username?: string }) => {
//   const { username } = args;
//   let id = `${args.id}`;

//   if (username) {
//     id = await redisClient.get(`usernameById:${username}`);
//     if (!id) {
//       id = formatRes(await db.users.findByName(username)).uuid;
//       await redisClient.set(`usernameByClient:${id}`, username);
//     }
//   }
//   if (!id) {
//     return;
//   }

//   let user = await cacheGet(`users:${id}`);

//   if (!cacheGet) {
//     user = formatUser(await db.users.findById(id));
//     await cacheSet(`users:${id}`, user);
//   }

//   return user;
// };

// const generateId = async (): Promise<string> => {
//   let id = nanoid();
//   let existingUser = formatUser(await db.users.findById(id));

//   if (existingUser) {
//     id = await generateId();
//   } else {
//     return id;
//   }

//   throw new Error('Failed to generate unique ID');
// }



const updateUser = (args: { id?: string, input }) => {
  
};

const deleteUser = () => {

};

export default {
  get: {
    // controller: getUser,
    // validation: {
    //   params: Joi.object({
    //     id: Joi.number().integer().min(1).max(9999999).required(),
    //   }),
    // }
  },
  create: {
    // controller: createUser,
  },
  update: {
    controller: updateUser,
  },
  delete: {
    controller: deleteUser,
  },
  // More powerful validation than GraphQL schema
};