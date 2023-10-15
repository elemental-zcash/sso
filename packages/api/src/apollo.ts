import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import bodyParser from 'body-parser';
import cors from 'cors';

import typeDefs from './graphql/types';
import resolvers from './graphql/resolvers';
import { APIWrapper, UsersAPI } from './data/api';
import { extractBearerToken } from './utils';
import { getUserFromAccessToken, oAuthClient } from './services/oauth.service';
import { AuthenticationError } from './errors';
import { UserType } from './models';



const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const guestApiWrapper = new APIWrapper(process.env.FLASK_API_URL);
const guestRepositories = { users: new UsersAPI(guestApiWrapper) }

class GuestViewer {
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
  isSystem: boolean;

  constructor() {
    this.isAuthenticated = false;
    this.roles = ['guest'];
    this.permissions = ['read'];
    this.isSystem = false;
  }

  get id() {
    return null;
  }

  get name() {
    return null;
  }
}

type FormattedUserType = Omit<Partial<UserType>, 'id'> & {
  id: string,
};
class AuthenticatedViewer implements FormattedUserType {
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
  isSystem: boolean;

  id: string;
  username: string;
  name: string;
  constructor(user) {
    this.isAuthenticated = true;

    this.id = user.uuid;
    this.username = user.login_id || user.username;
    this.isSystem = false;
    // this.roles = user.roles;
    // this.permissions = user.permissions;
  }
}

const injectAuthorizedApiWrapper = (repositories: { [key: string]: UsersAPI }, apiWrapper) => {
  Object.keys(repositories).forEach((repoName) => {
    const repo = repositories[repoName];
    repo.apiWrapper = apiWrapper;
  });
}

export const getContextFromRequest = async (req) => {
  const apiWrapper = new APIWrapper(process.env.FLASK_API_URL);
  const context = {
    request: req,
    viewer: new GuestViewer(),
    flaskApi: apiWrapper,
    users: new UsersAPI(apiWrapper),
    oAuth2Client: oAuthClient,
    token: null,
  };
  const token = extractBearerToken(req.headers);

  if (token) {
    const userMeta = await getUserFromAccessToken(token);
    
    if (userMeta) {
      context.flaskApi = new APIWrapper(process.env.FLASK_API_URL, token);
      injectAuthorizedApiWrapper({ ...({ users: context.users }) }, context.flaskApi);
      const user = await context.users.findById(userMeta, userMeta.id);

      console.log(JSON.stringify({ user }));
      context.viewer = new AuthenticatedViewer(user);
      context.token = token;
      console.log(JSON.stringify({ 'context.viewer': context.viewer }))
    } else {
      throw new AuthenticationError('Invalid access token');
    }
  }
  // context.

  return context;


  // try {
  //   if (!reqToken) {
  //     // throw new AuthenticationError('You must be logged in.');
  //     // TODO: Create guest viewer with rate limiting based on IP, etc, with HTML SSR for cache strategy
  //     const guestViewer = _Viewer.makePublicUser().toJSON();
  //     // log.debug({ guestViewer });
  //     return { request: req, ...guestRepositories, viewer: guestViewer, isPublic: true };
  //   }
  //   if (reqToken === process.env.SYSTEM_TOKEN) {
  //     const viewer = _Viewer.makeSystemUser();
  //     return { request: req, viewer: viewer.toJSON(), ...guestRepositories };
  //   }

  //   const apiWrapper = new APIWrapper(process.env.FLASK_API_URL, reqToken);

    

  //   const repositories = { users };
  //   // const token = await repositories.tokens.findByAccessToken(reqToken);
  //   // if (!(isBefore(Date.now(), new Date(token.accessTokenExpiresOn)))) {
  //   //   throw new AuthenticationError('Session has expired');
  //   // }
  //   const user = await getUserFromAccessToken(reqToken);
  //   const token = { userId: user.id };

  //   let viewer = new _Viewer((await repositories.users.getById({ isAuthenticating: true } as unknown as UserType, token.userId)));
  //   log.debug({ viewer });
  //   if (!viewer?.id) {
  //     throw new AuthenticationError('Failed to authenticate');
  //   }
  //   log.debug('viewer public id: ', viewer?.publicId);

  //   return { request: req, viewer: viewer.toJSON(), token, ...repositories };
  // } catch (error) {
  //   log.error(error);
  //   return undefined;
  // }
};

export type GraphQLContext = Awaited<ReturnType<typeof getContextFromRequest>>;



export const makeApolloServer = async (app, httpServer) => {
  // Set up ApolloServer.
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // // Proper shutdown for the WebSocket server.
      // {
      //   async serverWillStart() {
      //     return {
      //       async drainServer() {
      //         await serverCleanup.dispose();
      //       },
      //     };
      //   },
      // },
    ],
  });
  
  return apolloServer;
}

