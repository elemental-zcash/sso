import { UsersRepository } from './user.repo';
import { TokensRepository } from './token.repo';
import { AuthorizationCodesRepository } from './authorization-code.repo';
import { ClientsRepository } from './client.repo';

// Database Interface Extensions:
interface IExtensions {
    users: UsersRepository,
    tokens: TokensRepository,
    authorizationCodes: AuthorizationCodesRepository
    clients: ClientsRepository
}

export {
    IExtensions,
    UsersRepository,
    TokensRepository,
    AuthorizationCodesRepository,
    ClientsRepository,
};
