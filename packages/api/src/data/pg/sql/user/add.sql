INSERT INTO
  users(
    public_id,
    name,
    email,
    totp,
    email_confirmation,
    password_reset,
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
    ${totp},
    ${emailConfirmation},
    ${passwordReset},
    ${unverifiedEmail},
    ${isVerifiedEmail},
    ${username},
    ${roles},
    ${pswd}
  )
  RETURNING *
