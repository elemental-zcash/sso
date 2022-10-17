SELECT
  oauth_tokens.access_token AS "oauth_tokens.accessToken",
  oauth_tokens.access_token_expires_on AS "oauth_tokens.accessTokenExpiresOn",
  -- oauth_tokens.client_id AS "oauth_tokens.clientId",
  oauth_tokens.refresh_token AS "oauth_tokens.refreshToken",
  oauth_tokens.refresh_token_expires_on AS "oauth_tokens.refreshTokenExpiresOn",
  oauth_tokens.scopes AS "oauth_tokens.scopes",
  users.public_id AS "users.publicId",
  oauth_clients.client_id AS "oauth_clients.clientId"

  FROM oauth_tokens

  LEFT JOIN users
    ON users.id = oauth_tokens.user_id
  LEFT JOIN oauth_clients
    ON oauth_clients.id = oauth_tokens.client_id::INTEGER

  WHERE $1:name = $2;

