from flask import Blueprint, redirect, request, abort, jsonify
from authlib.integrations.flask_oauth2 import current_token
from api.schemas import UserSchema, LoginSchema, SignupSchema
from apifairy import authenticate, body, response
from authlib.integrations.flask_oauth2 import current_token


from api import bp as api
from oauth2 import require_oauth
from models import User
from api.errors import http_error
from db import db
from oauth2 import authorization


user_schema = UserSchema()
login_schema = LoginSchema()
signup_schema = SignupSchema()

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
