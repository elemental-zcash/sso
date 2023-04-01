import time
from flask import Blueprint, request, session, url_for, current_app
from flask import render_template, redirect, jsonify
from werkzeug.security import gen_salt
from authlib.integrations.flask_oauth2 import current_token
from authlib.oauth2 import OAuth2Error
import json

from db import db

from models import User, OAuth2Client
from oauth2 import authorization, require_oauth, MyIntrospectionEndpoint

bp = Blueprint('oauth', __name__)


def current_user():
    if 'id' in session:
        uid = session['id']
        return User.query.get(uid)
    return None


def split_by_crlf(s):
    return [v for v in s.splitlines() if v]


# @bp.route('/', methods=('GET', 'POST'))
# def home():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         user = User.query.filter_by(username=username).first()
#         if not user:
#             user = User(username=username)
#             db.session.add(user)
#             db.session.commit()
#         session['id'] = user.id
#         # if user is not just to log in, but need to head back to the auth page, then go for it
#         next_page = request.args.get('next')
#         if next_page:
#             return redirect(next_page)
#         return redirect('/')
#     user = current_user()
#     if user:
#         clients = OAuth2Client.query.filter_by(user_id=user.id).all()
#     else:
#         clients = []

#     return render_template('home.html', user=user, clients=clients)


# @bp.route('/logout')
# def logout():
#     del session['id']
#     return redirect('/')




# INSERT INTO oauth_clients(client_id, client_secret, grants, redirect_uri, access_token_lifetime, authorization_code_lifetime)
#   VALUES
#     ('sso-api', NULL, ARRAY ['authorization_code','refresh_token'], NULL, 5184000, 300),
#     ('sso-system', $1, ARRAY ['client'], NULL, 5184000, 300)
#   RETURNING *;


def generate_client(data, token_endpoint_auth_method='none'):
    token_endpoint_auth_method=data.get("token_endpoint_auth_method", "none")

    client_id = gen_salt(24)
    client_id_issued_at = int(time.time())
    client = OAuth2Client(
        client_id=client_id,
        client_id_issued_at=client_id_issued_at,
        client_name=data.get("client_name")
    )
    client_metadata = {
        "client_name": data.get("client_name"),
        "client_uri": data.get("client_uri"),
        "grant_types": data.get("grants"),
        "redirect_uris": data.get("redirect_uris"),
        "response_types": data.get("response_types"),
        "scope": data.get("scope"),
        "token_endpoint_auth_method": token_endpoint_auth_method,
    }
    client.set_client_metadata(client_metadata)
    if token_endpoint_auth_method == 'none':
        client.client_secret = ''
    elif current_app.config.get('CLIENT_SECRETS') != 'None' and current_app.config.get('CLIENT_SECRETS').get(data.get("client_name")) != 'None':
        client.client_secret = current_app.config.get('CLIENT_SECRETS').get(data.get("client_name"))
    else:
        client.client_secret = gen_salt(48)
    
    db.session.add(client)
    db.session.commit()

    return

# @bp.route('/create_client', methods=('GET', 'POST'))
# def create_client():
#     user = current_user()
#     if not user:
#         return redirect('/')
#     if request.method == 'GET':
#         return render_template('create_client.html')

#     client_id = gen_salt(24)
#     client_id_issued_at = int(time.time())
#     client = OAuth2Client(
#         client_id=client_id,
#         client_id_issued_at=client_id_issued_at,
#         user_id=user.id,
#     )

#     form = request.form
#     client_metadata = {
#         "client_name": form["client_name"],
#         "client_uri": form["client_uri"],
#         "grant_types": split_by_crlf(form["grant_type"]),
#         "redirect_uris": split_by_crlf(form["redirect_uri"]),
#         "response_types": split_by_crlf(form["response_type"]),
#         "scope": form["scope"],
#         "token_endpoint_auth_method": form["token_endpoint_auth_method"]
#     }
#     client.set_client_metadata(client_metadata)

#     if form['token_endpoint_auth_method'] == 'none':
#         client.client_secret = ''
#     else:
#         client.client_secret = gen_salt(48)

#     db.session.add(client)
#     db.session.commit()
#     return redirect('/')


@bp.route('/oauth/authorize', methods=['GET', 'POST'])
@require_oauth()
# @require_oauth('authorize')
def authorize():
    # user = current_user()
    user = current_token.user
    # if user log status is not true (Auth server), then to log it in
    if not user:
        return redirect(url_for('home.home', next=request.url))
    if request.method == 'GET':
        try:
            end_user=User.query.get(int(user.id))
            grant = authorization.get_consent_grant(end_user=end_user)
        except OAuth2Error as error:
            return error.error
        return jsonify({'user': user.serialize(), 'grant': {\
            'client': { 'client_name': grant.client.client_name },\
            'request': {'scope': grant.request.scope }\
        }})
        # return render_template('authorize.html', user=user, grant=grant)
    if not user and 'username' in request.form:
        username = request.form.get('username')
        user = User.query.filter_by(username=username).first()
    if request.form['confirm']:
        grant_user = user
    else:
        grant_user = None
    return authorization.create_authorization_response(grant_user=grant_user)


@bp.route('/oauth/token', methods=['POST'])
def issue_token():
    # print({'grant_type_refresh_token': client.check_grant_type('refresh_token')})
    return authorization.create_token_response()


@bp.route('/oauth/revoke', methods=['POST'])
def revoke_token():
    return authorization.create_endpoint_response('revocation')

@bp.route('/oauth/introspect', methods=['POST'])
def introspect_token():
    return authorization.create_endpoint_response(MyIntrospectionEndpoint.ENDPOINT_NAME)


@bp.route('/login', methods=['POST'])


@bp.route('/api/me')
@require_oauth('profile')
def api_me():
    user = current_token.user
    return jsonify(id=user.id, username=user.username)
