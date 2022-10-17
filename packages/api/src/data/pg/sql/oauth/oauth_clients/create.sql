CREATE TABLE oauth_clients (
  id SERIAL PRIMARY KEY,
  client_id TEXT,
  client_secret TEXT,
  grants TEXT[],
  redirect_uri TEXT,
  access_token_lifetime INTEGER,
  authorization_code_lifetime INTEGER
)
