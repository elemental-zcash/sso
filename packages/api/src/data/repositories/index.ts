/**
 * Data access layer
 */

import UserRepository from './user.repository';
import TokenRepository from './token.repository';
import AuthorizationCodeRepository from './authorization-code.repository';
import ClientRepository from './client.repository';


const users = new UserRepository();
const tokens = new TokenRepository();
const authorizationCodes = new AuthorizationCodeRepository();
const clients = new ClientRepository();

export { users, tokens, authorizationCodes, clients };
