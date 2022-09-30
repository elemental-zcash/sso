/**
 * Cache router
 */

import { UserType } from '../../models';
import { cacheGet, cacheSet } from '../../utils';

export const users = {
  getById: async (userId): Promise<UserType> => {
    const cachedUser = await cacheGet(`users:${userId}`) as UserType;
    return cachedUser;
  },
  save: async (user) => {
    const { uuid } = user;
    if (uuid) {
      return await cacheSet(`users:${uuid}`, user);
    }
    return null;
  },
};

export const tokens = {
  getTokenByRefreshToken: async (refreshToken: string) => {
    let accessToken = await cacheGet(`accessTokenByRefreshToken:${refreshToken}`);

    if (accessToken) {
      return await cacheGet(`tokens:${accessToken}`);
    }
    return null;
  },
  save: async (token) => {
    const { accessToken } = token;
    if (accessToken) {
      return await cacheSet(`tokens:${accessToken}`, token);
    }
    return null;
  },
};

