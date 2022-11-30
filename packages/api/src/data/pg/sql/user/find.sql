SELECT
  users.id AS "users.id",
  users.public_id AS "users.publicId",
  users.name AS "users.name",
  users.username AS "users.username",
  users.email AS "users.email",
  users.totp AS "users.totp",
  users.email_confirmation AS "users.emailConfirmation",
  users.zcashaddress_confirmation AS "users.zcashaddressConfirmation",
  users.password_reset AS "users.passwordReset",
  users.bio AS "users.bio",
  users.socials AS "users.socials",
  users.zcashaddress AS "users.zcashaddress",
  users.public_zcashaddress AS "users.publicZcashaddress",
  users.unverified_zcashaddress AS "users.unverifiedZcashaddress",
  users.unverified_email AS "users.unverifiedEmail",
  users.is_verified_email AS "users.isVerifiedEmail",
  users.pswd AS "users.pswd",
  users.joined_on AS "users.joinedOn"

  FROM users

  -- LEFT JOIN posts
  --   ON posts.user_id = users.id
  WHERE $1:raw = $2;
