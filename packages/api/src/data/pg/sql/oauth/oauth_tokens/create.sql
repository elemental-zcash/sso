CREATE TABLE oauth_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  access_token_expires_on timestamp without time zone NOT NULL,
  refresh_token TEXT NOT NULL,
  refresh_token_expires_on timestamp without time zone NOT NULL,
  scopes TEXT[],
  client_id INTEGER NOT NULL REFERENCES users(id),
  user_id INTEGER NOT NULL REFERENCES users(id)
);
