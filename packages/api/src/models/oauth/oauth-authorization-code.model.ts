import { models } from 'elemental-orm';
import User from '../user.model';


class OAuthAuthorizationCode extends models.Model {
  id = models.AutoField({ primary_key: true });
  authorizationCode = models.TextField();
  expiresAt = models.DateTimeField();
  redirectUri = models.TextField();
  clientId = models.TextField();
  userId = models.ForeignKey(User);

  Meta = {
    db_table: 'oauth_authorization_codes',
  }
}

export default OAuthAuthorizationCode;