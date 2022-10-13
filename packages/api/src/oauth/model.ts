// @ts-ignore
// await argon2.verify("<big long hash>", "password")

import { getRepisotory } from 'elemental-orm';
import { db } from '../data';
import { OAuthTokenType } from '../models';
// import Token from '../models/token';
// import User from '../models/user';
// import AuthorizationCode from '../models/authorization';
// import OauthClient from '../models/oauth-client';
// import Tokens from '../repositories/tokens';
// import Users from '../repositories/users';
let User, AuthorizationCode, OauthClient, config: any = {}; // FIXME: Mock objects here to make TypeScript happy
import * as repos from '../data/repositories';
import { addDays } from 'date-fns';
import log from 'loglevel';

// import { tokens as Tokens } from '../controllers';
// import config from '../../config.json';

// const tokenRepisotory = getRepisotory(Token);
// const userRepisotory = getRepisotory(User);
// const authorizationCodeRepisotory = getRepisotory(AuthorizationCode);
// const oauthClientRepisotory = getRepisotory(OauthClient);

export const getAccessToken = async (bearerToken) => {
  const token: OAuthTokenType = await db.tokens.findByAccessToken(bearerToken);
  log.debug('getAccessToken: ', { token })

  if (!token || !token.accessToken) {
    return {};
  }

  return {
    accessToken: token.accessToken,
    client: { id: token.clientId },
    accessTokenExpiresAt: new Date(token.accessTokenExpiresOn),
    user: { id: token.userId },
    scope: token.scopes?.join(' '),
  };
};

export const getAuthorizationCode = async (authCode) => {
  const authCodeRes = await repos.authorizationCodes.findByAuthCode(authCode);
  log.debug('getAuthorizationCode: ', { authCodeRes });
  if (!authCodeRes) {
    return null;
  }
  const { authorizationCode, expiresAt, redirectUri, clientId, userId, scopes } = authCodeRes;

  return {
    code: authorizationCode,
    expiresAt: expiresAt,
    redirectUri: redirectUri,
    scope: scopes?.join(' '),
    client: { id: clientId },
    user: { id: userId },
  };
};

export const saveAuthorizationCode = async (code, client, user) => {
  // const { users: { id } } = db.users.findById(user.id) as any;
  const authorizationCode = await repos.authorizationCodes.create({
    authorizationCode: code.authorizationCode, clientId: client.id, userId: user.id, expiresAt: code.expiresAt,
  })

  // const _ = await repos.authorizationCodes.create({ authorizationCode: code, })

  // const { authorizationCode } = await (db as any).authorizationCodes.create({ authorizationCode: code, clientId: client.id, userId: id });

  return {
    authorizationCode: authorizationCode.authorizationCode,
    expiresAt: authorizationCode.expiresAt,
    redirectUri: authorizationCode.redirectUri,
    scope: (authorizationCode.scopes || []).join(' '),
    client: { id: authorizationCode.clientId },
    user: { id: authorizationCode.userId}
  };
};

export const getClient = async (clientId: string, clientSecret?: string): Promise<unknown> => {
  const oAuthClient = await repos.clients.findById(clientId);
  console.log('getClient: ', { oAuthClient });
  // const oAuthClient = await repos.
  // const oAuthClient = await (db as any).oauthClients.get({ clientId, clientSecret })
  //   || config.clients.find((client) => client.clientId === clientId);

  if (!oAuthClient || (oAuthClient.clientSecret && oAuthClient.clientSecret !== clientSecret)) {
    return;
  }

  return {
    id: oAuthClient.clientId,
    clientId: oAuthClient.clientId,
    clientSecret: oAuthClient.clientSecret,
    grants: oAuthClient.grants,
    ...(oAuthClient.accessTokenLifetime && { accessTokenLifetime: oAuthClient.accessTokenLifetime }),
    ...(oAuthClient.authorizationCodeLifetime && { authorizationCodeLifetime: oAuthClient.authorizationCodeLifetime || 300 }),
  };
};

// export const getUserFromClient = async () => {
//   // TODO: ...

//   return {
//     id: 
//   }
// }

export const getRefreshToken = async (refreshToken: string): Promise<unknown> => {
  const token = await repos.tokens.findByRefreshToken(refreshToken);
  log.debug('getRefreshToken: ', { token });
  if (!token) {
    return null;
  }

  return {
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresOn,
    scope: token.scopes?.join(' '),
    client: { id: token.clientId }, // with 'id' property
    user: { id: token.userId }
  };
};

export const revokeToken = async (token): Promise<boolean> => {
  try {
    if (await repos.tokens.deleteByRefreshToken(token.refreshToken)) {
      log.debug('revokeToken');
      return true;
    }
  } catch (err) {
    log.debug('revokeToken: ', { err });
    return false;
  }
  return false;
};

export const revokeAuthorizationCode = async (code): Promise<Boolean> => {
  try {
    if (await repos.authorizationCodes.deleteByCode(code.code)) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}


export const saveToken = async (token, client, user) => {
  const { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, scope } = token;

  const tokens = await repos.tokens.create({
    accessToken,
    accessTokenExpiresOn: accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresOn: refreshTokenExpiresAt,
    clientId: client.clientId,
    userId: user.id,
    scopes: scope?.split(' '),
  });

  if (!tokens || tokens.accessToken === null) {
    return null;
  }
  log.debug('saveToken: ', { tokens });

  return {
    accessToken: tokens.accessToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresOn,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresOn,
    scope,
    client: { id: tokens.clientId },
    user: { id: tokens.userId },
  };
};

// FIXME: Remove stub
const isValidPassword = (pass: string, hash: string) => {
  if (pass === hash) {}

  return true;
};

export const getUser = async (username: string, password: string): Promise<{ id: string } | void> => {
  const res = await (db as any).users.get({ name: username });
  const { users } = res || {};

  if (!users || !users.id) {
    return null;
  }

  if (!isValidPassword(password, users.password)) {
    return null;
  }

  return {
    id: users.uuid,
  };
};

