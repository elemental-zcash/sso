INSERT INTO oauth_authorization_codes(authorization_code, expires_at, redirect_uri, client_id, user_id)
  VALUES(${authorizationCode}, ${expiresAt}, ${redirectUri}, (SELECT id from oauth_clients WHERE oauth_clients.client_id = ${clientId}), (SELECT id from users WHERE public_id = ${userId}))
  RETURNING *
