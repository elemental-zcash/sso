import { models } from 'elemental-orm';


class OAuthScope extends models.Model {
  id = models.AutoField({ primary_key: true });
  uuid = models.TextField();
  name = models.TextField();
  joinedOn = models.DateTimeField();

  Meta = {
    db_table: 'oauth_scopes',
  }
}

// const user = new User();
// export { user as User };

export default OAuthScope;