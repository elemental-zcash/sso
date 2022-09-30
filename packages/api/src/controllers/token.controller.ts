import { db } from '../data';
import { cacheDelete, cacheGet, cacheSet, objNotNull } from '../utils';
import userController from './user.controller';

const transformToken = (obj, uuid) => objNotNull(obj) && uuid && ({
  ...obj,
  userId: uuid,
});

const token = {
  findTokenByRefreshToken: {
    controller: async function findTokenByRefreshToken(refreshToken: string) {
      if (!refreshToken) {
        return;
      }
      let token;
      const accessToken = await cacheGet(`tokenByRefreshToken:${refreshToken}`);

      if (accessToken) {
        token = await cacheGet(`tokens:${accessToken}`);
      }

      if (!token) {
        const res = await db.tokens.findByRefreshToken(refreshToken) || {};
        token = transformToken(res.access_tokens, res.users.uuid);
        if (!(await cacheSet(`tokens:${accessToken}`, token))) {
          return;
        }
        await cacheSet(`tokenByRefreshToken:${accessToken}`, token.accessToken);
      }
      return token;
    },
    // validation: {
    //   params: Joi.object({
    //     id: Joi.number().integer().min(1).max(9999999).required(),
    //   }),
    // }
  },
  create: {
    controller: async function createToken(data) {
      const { accessToken, userId } = data;
      if (!accessToken) {
        return;
      }
      const user = await userController.get.controller({ id: userId }); // @ts-ignore
      const res = await db.tokens.add({ ...data, userId: user.dbIndex }) || {};
      console.log({ user, res });
      // @ts-ignore
      const token = transformToken(res.access_tokens, user.id);
      if (!await cacheSet(`tokens:${accessToken}`, token)) {
        return;
      }
      console.log('cache set');
      return token;
    },
  },
  // update: {
  //   controller: updateUser,
  // },
  deleteByRefreshToken: {
    controller: async function deleteByRefreshToken(refreshToken: string) {
      const accessToken = await cacheGet(`tokenByRefreshToken:${refreshToken}`);
      if (accessToken) {
        await cacheDelete(`tokens:${accessToken}`);
      }
      await db.tokens.deleteByRefreshToken(refreshToken);
    },
  },
  // More powerful validation than GraphQL schema
};

export default token;
