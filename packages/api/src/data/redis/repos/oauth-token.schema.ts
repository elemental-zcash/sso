import { Entity, Schema } from 'redis-om';

import { OAuthToken } from '../../../models';
import { getRedisSchemaFromModel } from '../../../utils';

export class OAuthTokenEntity extends Entity {};

export const oAuthTokenSchema = new Schema(OAuthTokenEntity, getRedisSchemaFromModel(OAuthToken));

export default oAuthTokenSchema;
