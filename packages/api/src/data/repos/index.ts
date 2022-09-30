import { UsersRepository } from './user.repository';
import { TokensRepository } from './token.repository';
// import {ProductsRepository} from './products';

// Database Interface Extensions:
interface IExtensions {
    users: UsersRepository,
    tokens: TokensRepository,
    // products: ProductsRepository
}

export {
    IExtensions,
    UsersRepository,
    TokensRepository,
    // ProductsRepository
};
