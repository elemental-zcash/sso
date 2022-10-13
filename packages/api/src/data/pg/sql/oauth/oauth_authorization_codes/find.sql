SELECT
  oauth_authorization_codes.authorization_code AS "oauth_authorization_codes.authorizationCode",
  oauth_authorization_codes.expires_at AS "oauth_authorization_codes.expiresAt",
  oauth_authorization_codes.redirect_uri AS "oauth_authorization_codes.redirectUri",
  oauth_authorization_codes.scopes AS "oauth_authorization_codes.scopes",
  oauth_clients.client_id AS "oauth_clients.clientId",
  users.public_id AS "users.publicId"

  FROM oauth_authorization_codes

  LEFT JOIN users
    ON oauth_authorization_codes.user_id = users.id
  LEFT JOIN oauth_clients
    ON oauth_authorization_codes.client_id = oauth_clients.id

  WHERE $1:name = $2;
