import { Entity, Schema } from 'redis-om';

import { User } from '../../../models';
import { getRedisSchemaFromModel } from '../../../utils';

export class UserEntity extends Entity {};

export const userSchema = new Schema(UserEntity, getRedisSchemaFromModel(User));

export default userSchema;
