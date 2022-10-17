import argon2 from 'argon2';
import { addMinutes } from 'date-fns';
import * as TokenUtil from 'oauth2-server/lib/utils/token-util';
import { checkUserRateLimit } from './rate-limit.service';

const saveAuthorizationCode = () => {
  // TODO: 
};

class RateLimitError extends Error {
  data: {
    retryAfter: number;
  };
  constructor(message: string, data: { retryAfter: number }) {
    super(message);
    this.data = this.data;
  }
}

export async function authenticate({ username, password, hash, email, ip }: {
  username?: string, password?: string, hash?: string, email: string, ip: string
}): Promise<{ code: string, expiresAt: Date } | null> {
  if (/*!username || */!hash || !password || !email || !ip) {
    return null;
  }
  const { onSuccess, onFailure, retryAfter } = await checkUserRateLimit(email, ip);

  if (!await argon2.verify(hash, password) || retryAfter) {
    if (retryAfter) {
      throw new RateLimitError('Rate limit reached.', { retryAfter });
    }
    await onFailure();
    return null;
  }
  await onSuccess();

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
