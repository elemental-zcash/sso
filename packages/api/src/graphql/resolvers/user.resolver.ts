import log from 'loglevel';
import argon2 from 'argon2';
import * as TokenUtil from 'oauth2-server/lib/utils/token-util';
import { addMinutes } from 'date-fns';
// import ExpressO

import { APIError, ErrorCodes } from '../utils';
import { GraphQLContext } from '../../app';
// import { omClient } from '../../data/redis';
// import { redisOmClient } from '../../server';
import { User, UserType } from '../../models';
import { generateId } from '../../controllers/user.controller';
import * as AuthService from '../../services/auth.service';
import * as MailService from '../../services/email.service';


const aliasId = (user) => {
  const { id, ..._user } = user;
  
  return {
    id: _user.publicId,
    ...user,
  };
}


export default {
  User: {
    // attribute: async (parent, { id }, context, info) => {
    // },
  },
  Query: {
    users: async (_, filters, context, info) => {
      const users = await context.users.all();

      console.log(users);
      return users.map(user => ({
        ...user.users,
        id: user.users.uuid,
      }));
    },
    user: async (_, { id }, context: GraphQLContext) => {
      let user;
      try {
        user = await context.users.findById(context.viewer, id);
      } catch(err) {
        console.log(err);
      }
      // console.log({ viewer: context.viewer });

      if (!user) {
        return {
          __typename: 'UserNotFoundError',
          message: `The user with the id ${id} does not exist.`,
        };
      }

      return {
        __typename: 'User',
        ...user,
        // ...aliasId(user),
      };
    },
    userByUsername: async (_, { name }, context: GraphQLContext) => {
      // const user: any = await context.users.get({ username: name }); // FIXME:

      // if (!user) {
      //   return {
      //     __typename: 'UserNotFoundError',
      //     message: `The user with the name ${name} does not exist.`,
      //   };
      // }

      // return {
      //   __typename: 'User',
      //   ...user,
      // };
    },
  },
  Mutation: {
    signup: async (_, { input }, context: GraphQLContext) => {
      const { email, username, name, password: pswd } = input;
      const pswdHsh = await argon2.hash(pswd);

      try {
        const publicId = await generateId(); // @ts-ignore
        const user = await context.users.create(context.viewer, { publicId, unverifiedEmail: email, username, name, pswd: pswdHsh, isVerifiedEmail: false });

        const authCode = await TokenUtil.generateRandomToken();
        const authCodeExpires = addMinutes((new Date()), 5);

        const authorizationCode = await context.authorizationCodes.create({
          authorizationCode: authCode, expiresAt: authCodeExpires, redirectUri: '', clientId: 'sso-api', userId: publicId,
        });

        // const token = await context.token.create()

        if (!user || !authorizationCode?.authorizationCode) {
          return {
            __typename: 'SignupError',
            message: 'Failed to create user',
            code: 'MISC',
          }
        }
        return {
          __typename: 'SignupSuccess',
          user: aliasId(user),
          code: authorizationCode.authorizationCode,
        };
      } catch (err) {
        log.error(err);
        throw new APIError('Failed to create user', ErrorCodes.MISC_ERROR);
      }
    },
    login: async (_, { input }, context: GraphQLContext) => {
      const { email, password } = input;

      const user = await context.users.findByEmail({ isAuthenticating: true } as unknown as UserType, email);

      const authCodes = await AuthService.authenticate({ hash: user?.pswd, password, username: user?.username });
      if (!authCodes || !user.publicId) {
        return {
          __typename: 'LoginError',
          message: 'Login failed: email or password is incorrect',
          code: ErrorCodes.MISC_ERROR,
        };
      }

      const authorizationCode = await context.authorizationCodes.create({
        authorizationCode: authCodes.code, expiresAt: authCodes.expiresAt, redirectUri: '', clientId: 'sso-api', userId: user.publicId,
      });

      return {
        __typename: 'LoginSuccess',
        user: aliasId(user),
        code: authorizationCode.authorizationCode,
      };
    },
    sendVerificationEmail: async (_, { address }, context) => {
      const emailAddress = '';
      // TODO: Get email from user DAL + rate limit (with curve?)
      // await MailService.sendVerificationEmail(emailAddress);

      return {};
    },
    // createUser: async (_, { id, input }, context) => {
    // },
    updateUser: async (_, { id, user }, context) => {
      try {
        const updatedUserRes = await context.users.put(id, user);

        if (!updatedUserRes) {
          throw new APIError('User not found', ErrorCodes.USER_NOT_FOUND);
        }

        const updatedUser = await context.users.byId(id);

        return {
          success: true,
          message: 'Success',
          user: updatedUser,
        };
      } catch (error) {
        log.warn(error);
        throw new APIError(error.message, ErrorCodes.MISC_ERROR);
      }
    },
    deleteUser: async (_, { id }, context) => {
      try {
        const success = await context.users.delete(id);
        if (!success) {
          throw new APIError('Failed to delete user', ErrorCodes.DELETE_ERROR);
        }

        return {
          success: true,
          message: 'Success',
        };
      } catch (error) {
        log.warn(error);
        throw new APIError(error.message, ErrorCodes.MISC_ERROR);
      }
    },
  },
};
