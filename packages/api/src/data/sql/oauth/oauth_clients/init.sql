INSERT INTO oauth_clients(client_id, client_secret, grants, redirect_uri, access_token_lifetime)
  VALUES("sso-api", NULL, ARRAY ['password','refresh_token'], NULL, 5184000)
  RETURNING *
