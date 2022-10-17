import { Entity, Schema } from 'redis-om';

import { OAuthAuthorizationCode, User } from '../../../models';
import { getRedisSchemaFromModel } from '../../../utils';

export class AuthorizationCodeEntity extends Entity {};

export const authorizationCodeSchema = new Schema(AuthorizationCodeEntity, getRedisSchemaFromModel(OAuthAuthorizationCode));

export default authorizationCodeSchema;
