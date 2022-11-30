SELECT
  users.id AS "users.id",
  users.public_id AS "users.publicId",
  users.name AS "users.name",
  users.username AS "users.username",
  users.email AS "users.email",
  users.totp AS "users.totp",
  users.email_confirmation AS "users.emailConfirmation",
  users.password_reset AS "users.passwordReset",
  users.unverified_email AS "users.unverifiedEmail",
  users.is_verified_email AS "users.isVerifiedEmail",
  users.pswd AS "users.pswd",
  users.joined_on AS "users.joinedOn"

  FROM users

  -- LEFT JOIN posts
  --   ON posts.user_id = users.id
  -- WHERE $1:name = $2;
  WHERE (email_confirmation->>'token') = $1;