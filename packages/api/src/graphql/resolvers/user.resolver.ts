import log from 'loglevel';
import argon2 from 'argon2';
import * as TokenUtil from 'oauth2-server/lib/utils/token-util';
import { addHours, addMinutes, isBefore } from 'date-fns';
// import ExpressO

import { APIError, ErrorCodes } from '../utils';
import { GraphQLContext } from '../../app';
// import { omClient } from '../../data/redis';
// import { redisOmClient } from '../../server';
import { User, UserType } from '../../models';
import { generateId } from '../../controllers/user.controller';
import * as AuthService from '../../services/auth.service';
import * as MailService from '../../services/email.service';
import { checkEmailVerificationLimit, checkUserRateLimit } from '../../services/rate-limit.service';
import { getIpFromReq } from '../../utils/misc';
import { db } from '../../data';


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
    viewer: async (_, {}, context: GraphQLContext) => {
      const { userId } = context.viewer || {};
      if (!context.viewer || !userId) {
        return {
          __typename: 'ViewerNotFoundError',
          message: 'Viewer not found',
          code: 'NOT_FOUND',
        };
      }
      // const viewer = { userId };

      return {
        __typename: 'Viewer',
        user: context.viewer,
        userId,
      };
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
        let existingUser = await context.users.findByEmail({ isAuthenticating: true } as unknown as UserType, email);
        if (!existingUser) {
          existingUser = await context.users.findByUnverifiedEmail({ isAuthenticating: true } as unknown as UserType, email);
        }
        if (existingUser) {
          log.debug('existingUser: SignupError');
          return {
            __typename: 'SignupError',
            message: 'Failed to create user. If you have already have an account, please try a password reset.',
            code: 'MISC',
          }
        }
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
            message: 'Failed to create user. If you have already have an account, please try a password reset.',
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

      let user = await context.users.findByEmail({ isAuthenticating: true } as unknown as UserType, email);
      let isVerifiedEmail;
      if (!user) {
        user = await context.users.findByUnverifiedEmail({ isAuthenticating: true } as unknown as UserType, email);
        isVerifiedEmail = false;
      }

      // const email = user.email || user.unverifiedEmail;

      let authCodes;
      try {
        log.debug('login: ', { user, email: (isVerifiedEmail === false) ? user.unverifiedEmail : user.email });
        authCodes = user.publicId && await AuthService.authenticate({
          hash: user?.pswd, password, username: user?.username, email: (isVerifiedEmail === false) ? user.unverifiedEmail : user.email/* || user.unverifiedEmail */, ip: getIpFromReq(context.request),
        });
      } catch (err) {
        if (err?.data?.retryAfter) {
          return {
            __typename: 'LoginError',
            message: 'Login failed: Too many attempts, try again later',
            code: ErrorCodes.MISC_ERROR,
          };
        }
      }

      if (!authCodes) {
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
    verifyEmail: async (_, { token }, context: GraphQLContext) => {
      const user = await db.users.findByEmailToken(token);
      // const user = await context.users.redisRepo.search().where('emailConfirmationToken').equals(token).return.first();
      log.debug({ user }); // @ts-ignore
      if (!user) {
        // return { message: 'error', code: 'ERROR' };
        return false;
      }
      const { token: userEmailToken, expiresAt } = (user.emailConfirmation as any) || {};
      log.debug({ now: new Date(), expiresAt: new Date(expiresAt), isBefore: isBefore(new Date(), new Date(expiresAt)) })
      if (token === userEmailToken && isBefore(new Date(), new Date(expiresAt))) {
        // FIXME: Allow to verify email token without being logged in?
        await context.users.update(context.viewer, user.publicId, { isVerifiedEmail: true, unverifiedEmail: null, email: user.unverifiedEmail });
        return true;
      }
      // log.debug('verifyEmail: ', { user, isEqual: token === user?.emailConfirmation?.token });

      return false;
      // const user = await context.users.findByUnverifiedEmail({ isAuthenticating: true } as unknown as UserType, address);

    },
    sendVerificationEmail: async (_, { address }, context: GraphQLContext) => {
      try {
        const user = await context.users.findByUnverifiedEmail(context.viewer as unknown as UserType, address);

        log.debug('sendVerificationEmail: ', { user, viewer: context.viewer });
        if (!user?.unverifiedEmail) {
          // log.trace('sendVerificationEmail: ', { user })
          return false;
        }
        // TODO: Email verification code with rate limit for UX - invalidate code after 5 incorrect tries? Or rate limit 4 tries an hour and expiry time of 
       // Number code (for i18n) - 1234 5678 ? 8 characters?
        const emailToken = await TokenUtil.generateRandomToken();
        const emailTokenExpiresAt = addHours((new Date()), 8);
        const updateRes = await context.users.update(context.viewer, user.publicId, {
          emailConfirmation: { token: emailToken, expiresAt: emailTokenExpiresAt },
        } as any);
        log.debug('sendVerificationEmail: ', { updateRes, emailToken });

        const { allow, retryAfter } = await checkEmailVerificationLimit(user.unverifiedEmail);
        if (allow && updateRes) {
          if (user.unverifiedEmail.includes('@macintoshhelper.com')) {
            await MailService.sendVerificationEmail(user.unverifiedEmail, emailToken);
          }
          log.debug('Sent verification email');

          return true;
        }
        // TODO: Throw error with some retry after info
        return false;
        // const emailAddress = '';
        // TODO: Get email from user DAL + rate limit (with curve?)
        // await MailService.sendVerificationEmail(emailAddress);

      } catch (err) {
        log.error({ err });
      }
      return false;
    },
    // createUser: async (_, { id, input }, context) => {
    // },
    updateUser: async (_, { input: { id, user } }, context: GraphQLContext) => {
      try {
        const { name, username, zcashaddress, bio, website, twitter, youtube, instagram } = user;

        const updatedUserRes = await context.users.update(context.viewer, id, ({
          name, username, zcashaddress, bio, socials: { website, twitter, youtube, instagram
        }} as any));
        
        // const updatedUserRes = await context.users.put(id, user);

        if (!updatedUserRes) {
          throw new APIError('User not found', ErrorCodes.USER_NOT_FOUND);
        }

        const updatedUser = await context.users.findById(context.viewer, id);

        return {
          __typename: 'UpdateUserSuccess',
          user: updatedUser,
        };
      } catch (error) {
        log.warn(error);
        throw new APIError('Update user failed', ErrorCodes.MISC_ERROR);
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
