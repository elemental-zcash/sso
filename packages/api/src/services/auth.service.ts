import argon2 from 'argon2';
import { addMinutes } from 'date-fns';
import * as TokenUtil from 'oauth2-server/lib/utils/token-util';

const saveAuthorizationCode = () => {
  // TODO: 
};


export async function authenticate({ username, password, hash }: { username?: string, password?: string, hash?: string }): Promise<{ code: string, expiresAt: Date } | null> {
  if (!username || !password || !hash || !await argon2.verify(hash, password)) {
    return null;
  }

  const authCode = await TokenUtil.generateRandomToken();
  const authCodeExpiresAt = addMinutes((new Date()), 5);

  return { code: authCode, expiresAt: authCodeExpiresAt };
}



/**
 * https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api
 * https://www.accountsjs.com/docs/server/#customising-the-jwt-payload
 * 
 * roles: ['system', 'admin', 'user']
 * 
 * 
 */
