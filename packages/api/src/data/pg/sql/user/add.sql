INSERT INTO
  users(
    public_id,
    name,
    email,
    totp_secret,
    unverified_email,
    is_verified_email,
    username,
    roles,
    pswd
  )
  VALUES(
    ${publicId},
    ${name},
    ${email},
    ${totpSecret},
    ${unverifiedEmail},
    ${isVerifiedEmail},
    ${username},
    ${roles},
    ${pswd}
  )
  RETURNING *
