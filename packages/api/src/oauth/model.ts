// @ts-ignore
// await argon2.verify("<big long hash>", "password")

import { getRepisotory } from 'elemental-orm';
// import Token from '../models/token';
// import User from '../models/user';
// import AuthorizationCode from '../models/authorization';
// import OauthClient from '../models/oauth-client';
// import Tokens from '../repositories/tokens';
// import Users from '../repositories/users';
let User, AuthorizationCode, OauthClient, Tokens, config: any = {}; // FIXME: Mock objects here to make TypeScript happy

// import config from '../../config.json';

// const tokenRepisotory = getRepisotory(Token);
const userRepisotory = getRepisotory(User);
const authorizationCodeRepisotory = getRepisotory(AuthorizationCode);
const oauthClientRepisotory = getRepisotory(OauthClient);

export const getAccessToken = async (bearerToken) => {
  const token: any = await Tokens.findByToken(bearerToken);

  return {
    accessToken: token.accessToken,
    client: { id: token.clientId },
    accessTokenExpiresAt: new Date(token.accessTokenExpiresOn),
    user: { id: token.userId }, // could be any object
    scope: token.scope,
  };
};

export const getAuthorizationCode = async (authorizationCode) => {
  const { authorizationCodes: code, users } = await authorizationCodeRepisotory.get({ authorizationCode });

  return {
    code: code.authorizationCode,
    expiresAt: new Date(code.expiresAt),
    redirectUri: code.redirectUri,
    scope: code.scope,
    client: { id: code.clientId },
    user: { id: users.uuid },
  };
};

export const saveAuthorizationCode = async (code, client, user) => {
  const { users: { id } } = userRepisotory.get({ uuid: user.id });

  const { authorizationCode } = await authorizationCodeRepisotory.create({ authorizationCode: code, clientId: client.id, userId: id });

  return {
    authorizationCode: authorizationCode.authorizationCode,
    expiresAt: authorizationCode.expiresAt,
    redirectUri: authorizationCode.redirectUri,
    scope: authorizationCode.scope,
    client: { id: authorizationCode.clientId },
    user: { id: authorizationCode.userId}
  };
};

export const getClient = async (clientId: string, clientSecret?: string): Promise<unknown> => {
  const oAuthClient = await oauthClientRepisotory.get({ clientId, clientSecret })
    || config.clients.find((client) => client.clientId === clientId);

  if (!oAuthClient || (oAuthClient.clientSecret && oAuthClient.clientSecret !== clientSecret)) {
    return;
  }

  return {
    clientId: oAuthClient.clientId,
    clientSecret: oAuthClient.clientSecret,
    grants: oAuthClient.grants,
    ...(oAuthClient.accessTokenLifetime && { accessTokenLifetime: oAuthClient.accessTokenLifetime }),
    ...(oAuthClient.authorizationCodeLifetime && { authorizationCodeLifetime: oAuthClient.authorizationCodeLifetime }),
  };
};

export const getRefreshToken = async (refreshToken: string): Promise<unknown> => {
  const token: any = await Tokens.findTokenByRefreshToken(refreshToken);

  return {
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresOn,
    scope: token.scope,
    client: { id: token.clientId }, // with 'id' property
    user: { id: token.userId }
  };
};

export const revokeToken = async (token: string): Promise<boolean> => {
  try {
    if (await Tokens.deleteByRefreshToken(token)) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
};


export const saveToken = async (token, client, user) => {
  const { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, scope } = token;

  const tokens = await Tokens.create({
    accessToken,
    accessTokenExpiresOn: accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresOn: refreshTokenExpiresAt,
    clientId: client.clientId,
    userId: user.id,
    scope,
  });

  if (!tokens || tokens.accessToken === null) {
    return null;
  }
  console.log({ tokens });

  return {
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
    scope,
    client: { id: tokens.clientId },
    user: { id: user.id },
  };
};

// FIXME: Remove stub
const isValidPassword = (pass: string, hash: string) => {
  if (pass === hash) {}

  return true;
};

export const getUser = async (username: string, password: string): Promise<{ id: string } | void> => {
  const res = await userRepisotory.get({ name: username });
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

