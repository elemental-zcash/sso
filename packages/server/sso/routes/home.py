from flask import Blueprint
from db import db
from models import OAuth2Client

bp = Blueprint('home', __name__)

@bp.route('/')
# @require_oauth(optional=True)
def home():
    # TODO: Create system API routes for managing/updating clients
    # oauth2_client = OAuth2Client.query.filter_by(client_id='kG7DwrwlOC72vGX4PyZstyHx').first()

    # oauth2_client.set_client_metadata({
    #     "client_name": oauth2_client.client_metadata.get('client_name'),
    #     "client_uri": oauth2_client.client_metadata.get('client_uri'),
    #     "grant_types": ['access_token', 'authorization_code', 'refresh_token', 'password'],
    #     "redirect_uris": oauth2_client.client_metadata.get('redirect_uris'),
    #     "response_types": oauth2_client.client_metadata.get('response_types'),
    #     "scope": oauth2_client.client_metadata.get('scope'),
    #     "token_endpoint_auth_method": oauth2_client.client_metadata.get('token_endpoint_auth_method'),
    # })
    # db.session.add(oauth2_client)
    # db.session.commit()


    return 'Hello World!'
