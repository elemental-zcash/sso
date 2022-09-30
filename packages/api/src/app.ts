// const path = require('path');
import path from 'path';
import express, { Router } from 'express';
import helmet from 'helmet';
import { graphqlHTTP } from 'express-graphql';
import log from 'loglevel';
import fs from 'fs';
import { getIntrospectionQuery } from 'graphql';
import fetch from 'node-fetch';
import ExpressOAuthServer from 'express-oauth-server';
// import OAuth2Server from 'express-oauth-server';
import { isBefore, parse } from 'date-fns';

import { makeExecutableSchema } from '@graphql-tools/schema';

import typeDefs from './graphql/types';
import resolvers from './graphql/resolvers';

// import repositories from './repositories';
import routes from './routes';

import * as Controllers from './controllers';

import { oAuthModel } from './oauth';

// import { db } from './data/pg';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

interface WithOAuthServer {
  oauth?: ExpressOAuthServer
}

type AppInterface = express.Application & WithOAuthServer;

const app: AppInterface = express();

app.oauth = new ExpressOAuthServer({
  model: oAuthModel,
  // require GraphQL client for now:
  //
  // requireClientAuthentication: {
  //   password: false,
  // },
});


if (process.env.NODE_ENV === 'development') {
  log.setLevel(log.levels.INFO);
}
else if (process.env.NODE_ENV === 'production') {
  log.setLevel(log.levels.WARN);
}

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(helmet());

const controllers = {
  users: {
    get: Controllers.users.get,
    create: Controllers.users.create,
    update: Controllers.users.update,
    delete: Controllers.users.delete,
  },
};

const getContextFromRequest = async (req) => {
  // return {};
  try {
    let viewer;
    let token;
    const reqToken =
      req.headers &&
      req.headers.authorization &&
      (req.headers.authorization as string).replace(/^\s*Bearer\s*/, '');
    // if (reqToken) {
    //   console.log({ reqToken });
    //   token = await db.tokens.findByToken(reqToken);
    //   console.log({ now: Date.now(), expiresAt: new Date(token.accessTokenExpiresOn) });
    //   if (isBefore(Date.now(), new Date(token.accessTokenExpiresOn))) {
    //     viewer = await db.users.findById(token.userId);
    //     console.log(123, ' ', viewer.uuid);
    //   }
    // }
    return { request: req, viewer, token, ...controllers };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export type GraphQLContext = Awaited<ReturnType<typeof getContextFromRequest>>;

// password grant here
app.post('/oauth/token', (req, res) => {

  // console.log({ reqBody: req.body });
  app.oauth.token()(req, res);
});

app.post('/oauth/authorize', function(req, res) {
  // Redirect anonymous users to login page.
  // if (!req.app.locals.user) {
  //   return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  // }

  return app.oauth.authorize();
});




app.use('/graphql', graphqlHTTP(async (request) => {
  return {
    schema,
    context: await getContextFromRequest(request),
    graphiql: true || process.env.NODE_ENV === 'development',
    introspection: process.env.NODE_ENV === 'development'
  };
}));

// TODO: Add auth for this and make it an API route
// app.use('/schema.json', async (req, res) => {
//   await fetch('http://localhost:8080/graphql', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query: getIntrospectionQuery() })
//   })
//     .then(res => res.json())
//     .then(res =>
//       fs.writeFileSync(path.join(__dirname, './schema.json'), JSON.stringify(res.data, null, 2))
//     );

//   res.end();
// });

// Logging middleware
// app.use((req, res, next) => {
//   console.log(JSON.stringify({ url: req.url, body: req.body, params: req.params }));

//   next(req, res);
// });
// app.use((req, _, next) => {
//   console.log(JSON.stringify({ url: req.url, body: req.body, params: req.params }, null, 2));

//   next();
// });


routes(app);

const router = Router();

const routeMiddleware = routes(router);

app.use(routeMiddleware);

app.use((_, res) => {
  res.status(404).json({ statusCode: 404, error: 'Not Found', message: 'Page not found' });
});

app.use((err, req, res) => {
  // @ts-ignore
  res.locals.message = err.message;
  // @ts-ignore
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // @ts-ignore
  res.status(err.status || 500);

  // @ts-ignore
  res.end();
});

export default app;

