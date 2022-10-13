INSERT INTO oauth_tokens(access_token, access_token_expires_on, refresh_token, refresh_token_expires_on, client_id, scopes, user_id)
  VALUES(${accessToken}, ${accessTokenExpiresOn}, ${refreshToken}, ${refreshTokenExpiresOn}, (SELECT id from oauth_clients WHERE oauth_clients.client_id = ${clientId}), ${scopes}, (SELECT id from users WHERE users.public_id = ${userId}))
  RETURNING *;
