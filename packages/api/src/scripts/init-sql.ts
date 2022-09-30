/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { db } from '../data/pg';

import { reset, users, oauthClients, oauthScopes, oauthTokens, oauthAuthorizationCodes } from '../data/sql';


// db.none(reset);
// db.none(users.create);




const init = async () => {
  try {
    await db.tx(async (t) => {
      await t.none(reset);
      await t.none(users.create);
      await t.none(oauthTokens.create);
      await t.none(oauthScopes.create);
      await t.none(oauthClients.create);
      await t.none(oauthAuthorizationCodes.create);
    });


    // success;
    console.log('Success!');
  } catch (error) {
    console.log('ERROR:', error);
    throw error;
  }
};

export default init;
