CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT, -- TODO: Use aliasing to change to display_name?
  email TEXT UNIQUE,
  totp JSONB,
  unverified_email TEXT,
  is_verified_email BOOLEAN NOT NULL,
  email_confirmation JSONB,
  socials JSONB,
  bio TEXT,
  zcashaddress TEXT,
  password_reset JSONB,
  username VARCHAR(255) UNIQUE,
  joined_on timestamptz NOT NULL DEFAULT now(),
  roles TEXT[],
  pswd TEXT NOT NULL
);
