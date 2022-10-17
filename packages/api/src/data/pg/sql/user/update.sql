UPDATE users
  SET public_id = ${publicId},
    "name" = ${name},
    email = ${email},
    totp = ${totp},
    email_confirmation = ${emailConfirmation},
    password_reset = ${passwordReset},
    unverified_email = ${unverifiedEmail},
    is_verified_email = ${isVerifiedEmail},
    bio = ${bio},
    socials = ${socials},
    zcashaddress = ${zcashaddress},
    username = ${username},
    roles = ${roles},
    pswd = ${pswd}

  WHERE public_id = ${publicId}
  
  RETURNING *
