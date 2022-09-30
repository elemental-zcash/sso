import log from 'loglevel';
import argon2 from 'argon2';

import { APIError, ErrorCodes } from '../utils';
import { GraphQLContext } from '../../app';


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
      const user: any = await context.users.get({ id });
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
      };
    },
    userByUsername: async (_, { name }, context: GraphQLContext) => {
      const user: any = await context.users.get({ username: name }); // FIXME:

      if (!user) {
        return {
          __typename: 'UserNotFoundError',
          message: `The user with the name ${name} does not exist.`,
        };
      }

      return {
        __typename: 'User',
        ...user,
      };
    },
  },
  Mutation: {
    signup: async (_, { input }, context: GraphQLContext) => {
      const { email, username, name, password: pswd } = input;
      const pswdHsh = await argon2.hash(pswd);

      try {
        let user = await context.users.create({ unverifiedEmail: email, username, name, pswd: pswdHsh });

        return {
          __typename: 'SignupSuccess',
          user: user,
          token: {}, // TODO:
        };
      } catch (err) {
        log.error(err);
        throw new APIError('Failed to create user', ErrorCodes.MISC_ERROR);
      }
    },
    login: async (_, { input }, context) => {

    },
    // createUser: async (_, { id, input }, context) => {
    //   try {
    //     console.log({ id, input });
    //     // const { input } = body;
    //     const users = await context.users.create(input);

    //     console.log({ users });
    //     return {
    //       __typename: 'CreateUserSuccess',
    //       user: {
    //         ...users,
    //         id: users.uuid,
    //       },
    //     };
    //   } catch (error) {
    //     log.warn(error);
    //     throw new APIError(error.message, ErrorCodes.MISC_ERROR);
    //   }
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
