/**
 * Pure/stripped controller functions
 */
import userController from './user.controller';
import authCodeController from './auth-code.controller';
import tokenController from './token.controller';

export const users = {
  get: userController.get.controller,
  create: userController.create.controller,
  update: userController.update.controller,
  delete: userController.delete.controller, 
}

// export const tokens = {
//   findByToken
//   delete: tokenController
// }
