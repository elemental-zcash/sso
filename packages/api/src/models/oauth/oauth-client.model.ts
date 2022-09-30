import { models } from 'elemental-orm';

import * as customModels from '../custom';


class OAuthClient extends models.Model {
  id = models.AutoField({ primary_key: true });
  client_secret = models.TextField();
  grants = customModels.TextArrayField();
  redirectUri = models.TextField();
  accessTokenLifetime = models.IntegerField();

  Meta = {
    db_table: 'oauth_clients',
  }
}

const oauthClient = new OAuthClient({} as any, {} as any);
export { oauthClient as OAuthClient };

export default OAuthClient;