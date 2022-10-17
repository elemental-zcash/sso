import { Entity, Schema } from 'redis-om';

import { OAuthScope } from '../../../models';
import { getRedisSchemaFromModel } from '../../../utils';

export class OAuthScopeEntity extends Entity {};

export const oAuthScopeSchema = new Schema(OAuthScopeEntity, getRedisSchemaFromModel(OAuthScope));

export default oAuthScopeSchema;
