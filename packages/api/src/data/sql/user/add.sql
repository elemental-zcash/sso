INSERT INTO users(uuid, username, email, pswd, display_name, is_verified_email)
  VALUES(${uuid}, ${username}, ${email}, ${pswd}, ${display_name}, ${is_verified_email})
  RETURNING *
