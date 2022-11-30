UPDATE users
  SET public_id = ${publicId},
    "name" = ${name},
    email = ${email},
    totp = ${totp},
    email_confirmation = ${emailConfirmation},
    zcashaddress_confirmation = ${zcashaddressConfirmation},
    password_reset = ${passwordReset},
    unverified_email = ${unverifiedEmail},
    is_verified_email = ${isVerifiedEmail},
    bio = ${bio},
    socials = ${socials},
    zcashaddress = ${zcashaddress},
    unverified_zcashaddress = ${unverifiedZcashaddress},
    public_zcashaddress = ${publicZcashaddress},
    username = ${username},
    roles = ${roles},
    pswd = ${pswd}

  WHERE public_id = ${publicId}
  
  RETURNING *
