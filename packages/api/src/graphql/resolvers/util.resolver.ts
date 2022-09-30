import init from '../../scripts/init-sql';

const resolver = {
  Mutation: {
    resetDatabase: async () => {
      try {
        await init();
        // TODO: Only allow in dev environment with auth

        return { success: true, message: 'Database reset.' };
      } catch (err) {
        throw err;
      }
    },
  }
}

export default resolver;
