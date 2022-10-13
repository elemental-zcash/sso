import { models } from 'elemental-orm';

import * as customModels from '../custom';


class OAuthClient extends models.Model {
  id = models.AutoField({ primary_key: true, redisType: 'string' });
  clientId = models.TextField();
  clientSecret = models.TextField();
  grants = models.TextArrayField();
  redirectUri = models.TextField();
  accessTokenLifetime = models.IntegerField();
  authorizationCodeLifetime = models.IntegerField();

  Meta = {
    db_table: 'oauth_clients',
  }
}

const oauthClient = new OAuthClient({} as any, {} as any);
export { oauthClient as OAuthClient };

export default OAuthClient;