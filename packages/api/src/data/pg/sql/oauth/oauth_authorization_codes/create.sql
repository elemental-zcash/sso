CREATE TABLE oauth_authorization_codes (
  id SERIAL PRIMARY KEY,
  authorization_code TEXT NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now(),
  redirect_uri TEXT,
  scopes TEXT[],
  client_id INTEGER NOT NULL REFERENCES oauth_clients(id),
  user_id INTEGER NOT NULL REFERENCES users(id)
);
