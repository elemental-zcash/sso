import { models } from 'elemental-orm';

import * as customModels from '../custom';

import User from '../user.model';


class OAuthToken extends models.Model {
  id = models.AutoField({ primary_key: true });
  accessToken = models.TextField();
  accessTokenExpiresOn = models.IntegerField();
  refreshToken = models.TextField();
  refreshTokenExpiresOn = models.IntegerField();
  scopes = customModels.TextArrayField();
  clientId = models.TextField();
  userId = models.ForeignKey(User);

  Meta = {
    db_table: 'oauth_tokens',
  }
}

export default OAuthToken;
