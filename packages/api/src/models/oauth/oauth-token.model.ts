import { models } from 'elemental-orm';

import * as customModels from '../custom';

import User from '../user.model';
import OAuthClient from './oauth-client.model';


class OAuthToken extends models.Model {
  id = models.AutoField({ primary_key: true });
  accessToken = models.TextField();
  accessTokenExpiresOn = models.DateTimeField();
  refreshToken = models.TextField();
  refreshTokenExpiresOn = models.DateTimeField();
  scopes = models.TextArrayField();
  clientId = models.ForeignKey(OAuthClient, { redisType: 'string' });
  userId = models.ForeignKey(User, { redisType: 'string' });

  Meta = {
    db_table: 'oauth_tokens',
  }
}

export default OAuthToken;
