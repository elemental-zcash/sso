import { models } from 'elemental-orm';

import User from '../user.model';
import OAuthClient from './oauth-client.model';


class OAuthAuthorizationCode extends models.Model {
  id = models.AutoField({ primary_key: true });
  authorizationCode = models.TextField();
  expiresAt = models.DateTimeField();
  redirectUri = models.TextField();
  clientId = models.ForeignKey(OAuthClient, { redisType: 'string' });
  scopes = models.TextArrayField();
  // TODO: scope = ... ?
  userId = models.ForeignKey(User, { redisType: 'string' });

  Meta = {
    db_table: 'oauth_authorization_codes',
  }
}

export default OAuthAuthorizationCode;