INSERT INTO oauth_clients(client_id, client_secret, grants, redirect_uri, access_token_lifetime, authorization_code_lifetime)
  VALUES
    ('sso-api', NULL, ARRAY ['authorization_code','refresh_token'], NULL, 5184000, 300),
    ('sso-system', $1, ARRAY ['client'], NULL, 5184000, 300)
  RETURNING *;
