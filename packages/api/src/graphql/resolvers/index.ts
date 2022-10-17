import { mergeResolvers } from '@graphql-tools/merge';

import scalarResolver from './scalar.resolver';

import userResolver from './user.resolver';
import utilResolver from './util.resolver';

const resolvers = [
  scalarResolver,
  userResolver,
  utilResolver,
];

export default mergeResolvers(resolvers);
