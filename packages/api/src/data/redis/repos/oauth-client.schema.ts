import { Entity, Schema } from 'redis-om';

import { OAuthClient } from '../../../models';
import { getRedisSchemaFromModel } from '../../../utils';

export class OAuthClientEntity extends Entity {};

export const oAuthClientSchema = new Schema(OAuthClientEntity, getRedisSchemaFromModel(OAuthClient));

export default oAuthClientSchema;
