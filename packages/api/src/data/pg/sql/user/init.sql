INSERT INTO users(public_id, username, email, pswd, display_name, is_verified_email, roles)
  VALUES(${publicId}, ${username}, ${email}, ${pswd}, ${displayName}, ${isVerifiedEmail}, ARRAY ['client'])
  RETURNING *
