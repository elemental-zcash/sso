CREATE TABLE oauth_scopes (
  id SERIAL PRIMARY KEY,
  scope TEXT NOT NULL UNIQUE,
  is_default BOOLEAN
);
