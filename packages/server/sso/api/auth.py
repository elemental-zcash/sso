from flask import Blueprint, redirect, request, abort, jsonify
from authlib.integrations.flask_oauth2 import current_token
from api.schemas import UserSchema, LoginSchema, SignupSchema
from apifairy import authenticate, body, response
from authlib.integrations.flask_oauth2 import current_token
import copy


from api import bp as api
from oauth2 import require_oauth, AuthorizationCodeGrant
from models import User, OAuth2Client
from api.errors import http_error
from db import db
from oauth2 import authorization

import re
import base64

login_id_pattern = "^[A-Z1-9]{16}$"



user_schema = UserSchema()
login_schema = LoginSchema()
signup_schema = SignupSchema()

# def save_authorization_code(request, user):
#     # Generate authorization code
#     code = oauth.generate_authorization_code(request.client, user)

#     # Save authorization code to database
#     auth_code = OAuth2AuthorizationCode(
#         client_id=request.client.client_id,
#         user_id=user.id,
#         code=code['code'],
#         redirect_uri=request.redirect_uri,
#         response_type=request.response_type,
#         scope=request.scope
#     )
#     db.session.add(auth_code)
#     db.session.commit()

#     return code

@api.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':

        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return jsonify({'error': 'Missing or invalid Authorization header.'}), 401

        try:
            auth_decoded = base64.b64decode(auth_header[6:]).decode()
            client_id, client_secret = auth_decoded.split(':', 1)
        except:
            return jsonify({'error': 'Malformed Authorization header.'}), 401

        client = OAuth2Client.query.filter_by(client_id=client_id).first()
        if not client or client.client_secret != client_secret:
            return jsonify({'error': 'Invalid client credentials.'}), 401

        username = request.form['username']
        password = request.form['password']

        user = None
        if (re.match(login_id_pattern, username)):
            user = User.query.filter_by(login_id=username).first()
        else:
            user = User.query.filter_by(unverified_email=username).first()
        if user is not None and user.verify_password(password):
            oauth2_request = authorization.create_oauth2_request(request)

            oauth2_request.client = client

            oauth2_request.data = {
                'code_challenge': request.form.get('code_challenge'),
                'code_challenge_method': request.form.get('code_challenge_method'),
                'redirect_uri': request.form.get('redirect_uri', '')
            }
            oauth2_request.user = user

            grant = AuthorizationCodeGrant(oauth2_request, authorization)

            code = grant.generate_authorization_code()
            grant.save_authorization_code(code, oauth2_request)

            return jsonify({ 'code': code })
        else:
            return 'Invalid credentials';
        #     return user

        # # Verify username and password

        # user = users.get(username)
        # if user and user['password'] == password:
        #     # Generate a random authorization code
        #     code = generate_token(48)


        #     authorization.createa
        #     # Store the code in a database or cache
        #     # Redirect to the authorization endpoint with the code and state
        #     return redirect(authorization.create_authorization_response(
        #         code=code,
        #         state=request.args.get('state')
        #     ))
        # else:
        #     # Incorrect username or password
        #     return 'Invalid credentials'
    return None

@api.route('/auth/email/confirm/<token>')
@require_oauth()
def confirm_email(token):
    user = User.query.get(current_token.user_id)
    if (user.confirm_email(token)):
        return jsonify({ 'message': 'Your email has been confirmed. Thanks!'})
    else:
        return jsonify({ 'message': 'The confirmation link is invalid or has expired.'})

@api.route('/auth/confirm')
@require_oauth()
def resend_confirmation(request):
    user = User.query.get(current_token.user_id)
    
    token = user.generate_email_confirmation_token()

    # send_email(user.unverified_email, 'Confirm Your Account',
    #            'auth/email/confirm', user=current_user, token=token)
    return jsonify({ 'message': 'A new confirmation email has been sent to you by email.'})
    return redirect(url_for('main.index'))

@api.route('/auth/confirm/<user_id>')
@require_oauth(['system'])
def system_resend_confirmation(user_id):
    user = User.query.filter_by(uuid=user_id).first()
    if (user is None):
        return jsonify({ 'error': 'User not found.' })
    
    token = user.generate_email_confirmation_token()

    print({ 'token': token })
    return jsonify({ 'token': token, 'message': 'A new confirmation email has been sent to you by email.'})

# @api.route('/auth/change-password', methods=['GET', 'POST'])
# @require_oauth()
# def change_password():
#     form = ChangePasswordForm()
#     if form.validate_on_submit():
#         if user.verify_password(form.old_password.data):
#             user.password = form.password.data
#             db.session.add(user)
#             db.session.commit()
#             flash('Your password has been updated.')
#             return redirect(url_for('main.index'))
#         else:
#             flash('Invalid password.')
#     return render_template("auth/change_password.html", form=form)

# @api.route('/auth/reset-password', methods=['GET', 'POST'])
# def password_reset_request():
#     if not current_user.is_anonymous:
#         return redirect(url_for('main.index'))
#     form = PasswordResetRequestForm()
#     if form.validate_on_submit():
#         user = User.query.filter_by(email=form.email.data.lower()).first()
#         if user:
#             token = user.generate_reset_token()
#             send_email(user.email, 'Reset Your Password',
#                        'auth/email/reset_password',
#                        user=user, token=token)
#         flash('An email with instructions to reset your password has been '
#               'sent to you.')
#         return redirect(url_for('auth.login'))
#     return render_template('auth/reset_password.html', form=form)


# @api.route('/auth/reset-password/<token>', methods=['GET', 'POST'])
# def password_reset(token):
#     user = User.query.get(current_token.user_id)
#     if not current_token.user_id is None:
#         return jsonify({ 'message': 'You are logged in, you need to be logged out to request a password reset.'})
#     form = PasswordResetForm()
#     if form.validate_on_submit():
#         if User.reset_password(token, form.password.data):
#             db.session.commit()
#             flash('Your password has been updated.')
#             return redirect(url_for('auth.login'))
#         else:
#             return redirect(url_for('main.index'))
#     return render_template('auth/reset_password.html', form=form)

# @api.route('/auth/change-email', methods=['GET', 'POST'])
# @require_oauth()
# def change_email_request():
#     user = User.query.get(current_token.user_id)
#     form = ChangeEmailForm()
#     if form.validate_on_submit():
#         if user.verify_password(form.password.data):
#             new_email = form.email.data.lower()
#             token = user.generate_email_change_token(new_email)
#             send_email(new_email, 'Confirm your email address',
#                        'auth/email/change_email',
#                        user=current_user, token=token)
#             flash('An email with instructions to confirm your new email '
#                   'address has been sent to you.')
#             return redirect(url_for('main.index'))
#         else:
#             flash('Invalid email or password.')
#     return render_template("auth/change_email.html", form=form)


# @api.route('/auth/change-email/<token>')
# @require_oauth()
# def change_email(token):
#     user = User.query.get(current_token.user_id)
#     if user.change_email(token):
#         db.session.commit()
#         flash('Your email address has been updated.')
#     else:
#         flash('Invalid request.')
#     return redirect(url_for('main.index'))
