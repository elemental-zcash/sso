CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, -- TODO: Use aliasing to change to display_name?
  email TEXT UNIQUE,
  totp_secret TEXT,
  unverified_email TEXT,
  is_verified_email BOOLEAN NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  joined_on timestamptz NOT NULL DEFAULT now(),
  pswd TEXT NOT NULL
);
