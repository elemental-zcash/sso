from authlib.integrations.flask_oauth2 import (
    AuthorizationServer,
    ResourceProtector,
)
from authlib.integrations.sqla_oauth2 import (
    create_query_client_func,
    create_save_token_func,
    create_revocation_endpoint,
    create_bearer_token_validator,
)
from authlib.oauth2.rfc6749 import grants
from authlib.oauth2.rfc7636 import CodeChallenge
from authlib.oauth2.rfc7662 import IntrospectionEndpoint
import re

from db import db
from models.user import User
from models.oauth import OAuth2Client, OAuth2AuthorizationCode, OAuth2Token

login_id_pattern = "^[A-Z1-9]{16}$"

class AuthorizationCodeGrant(grants.AuthorizationCodeGrant):
    TOKEN_ENDPOINT_AUTH_METHODS = [
        'client_secret_basic',
        'client_secret_post',
        'none',
    ]

    def save_authorization_code(self, code, request):
        code_challenge = request.data.get('code_challenge')
        code_challenge_method = request.data.get('code_challenge_method')
        auth_code = OAuth2AuthorizationCode(
            code=code,
            client_id=request.client.client_id,
            redirect_uri=request.redirect_uri,
            scope=request.scope,
            user_id=request.user.id,
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method,
        )
        db.session.add(auth_code)
        db.session.commit()
        return auth_code

    def query_authorization_code(self, code, client):
        auth_code = OAuth2AuthorizationCode.query.filter_by(
            code=code, client_id=client.client_id).first()
        if auth_code and not auth_code.is_expired():
            return auth_code

    def delete_authorization_code(self, authorization_code):
        db.session.delete(authorization_code)
        db.session.commit()

    def authenticate_user(self, authorization_code):
        return User.query.get(authorization_code.user_id)


class PasswordGrant(grants.ResourceOwnerPasswordCredentialsGrant):
    # TOKEN_ENDPOINT_AUTH_METHODS = [
    #     'client_secret_basic',
    #     'client_secret_post',
    #     # 'none',
    # ]

    def authenticate_user(self, username, password):
        user = None
        if (re.match(login_id_pattern, username)):
            user = User.query.filter_by(login_id=username).first()
        else:
            user = User.query.filter_by(unverified_email=username).first()
        if user is not None and user.verify_password(password):
            return user


class RefreshTokenGrant(grants.RefreshTokenGrant):
    def authenticate_refresh_token(self, refresh_token):
        token = OAuth2Token.query.filter_by(refresh_token=refresh_token).first()
        if token and token.is_refresh_token_active():
            return token

    def authenticate_user(self, credential):
        return User.query.get(credential.user_id)

    def revoke_old_credential(self, credential):
        credential.revoked = True
        db.session.add(credential)
        db.session.commit()

def get_token_username(token):
    return token.user.login_id

def get_token_user_sub(token):
    return token.user.uuid

class MyIntrospectionEndpoint(IntrospectionEndpoint):
    def query_token(self, token, token_type_hint):
        if token_type_hint == 'access_token':
            tok = OAuth2Token.query.filter_by(access_token=token).first()
        elif token_type_hint == 'refresh_token':
            tok = OAuth2Token.query.filter_by(refresh_token=token).first()
        else:
            # without token_type_hint
            tok = OAuth2Token.query.filter_by(access_token=token).first()
            if not tok:
                tok = OAuth2Token.query.filter_by(refresh_token=token).first()
        return tok

    def introspect_token(self, token):
        # print({ 'username': get_token_username(token), 'sub': get_token_user_sub(token), 'expires_at': token.expires_at })
        return {
            'active': True,
            'client_id': token.client_id,
            'token_type': token.token_type,
            'username': get_token_username(token),
            'scope': token.get_scope(),
            'sub': get_token_user_sub(token),
            'aud': token.client_id,
            'iss': 'https://sso.elementalzcash.com/',
            'exp': token.expires_at(),
            'iat': token.issued_at,
        }

    def check_permission(self, token, client, request):
        # for example, we only allow internal client to access introspection endpoint
        # return client.client_type == 'internal'
        # return True
        # print({ 'client_name': client.client_metadata.get('client_name') })
        return client.client_metadata.get('client_name') == 'sso-system'


query_client = create_query_client_func(db.session, OAuth2Client)
save_token = create_save_token_func(db.session, OAuth2Token)
authorization = AuthorizationServer(
    query_client=query_client,
    save_token=save_token,
)
require_oauth = ResourceProtector()


def config_oauth(app):
    authorization.init_app(app)

    # support all grants
    authorization.register_grant(grants.ImplicitGrant)
    authorization.register_grant(grants.ClientCredentialsGrant)
    authorization.register_grant(AuthorizationCodeGrant, [CodeChallenge(required=True)])
    authorization.register_grant(PasswordGrant)
    authorization.register_grant(RefreshTokenGrant)

    # support revocation
    revocation_cls = create_revocation_endpoint(db.session, OAuth2Token)
    authorization.register_endpoint(revocation_cls)

    authorization.register_endpoint(MyIntrospectionEndpoint)

    # protect resource
    bearer_cls = create_bearer_token_validator(db.session, OAuth2Token)
    require_oauth.register_token_validator(bearer_cls())