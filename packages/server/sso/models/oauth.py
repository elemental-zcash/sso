import time
import os
import json
from flask import current_app
from db import db;

from authlib.integrations.sqla_oauth2 import (
    OAuth2ClientMixin,
    OAuth2AuthorizationCodeMixin,
    OAuth2TokenMixin,
)



class OAuth2Client(db.Model, OAuth2ClientMixin):
    __tablename__ = 'oauth2_clients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    user = db.relationship('User')
    _client_name = db.Column('client_name', db.String(120), nullable=True)

    @staticmethod
    def insert_clients():
        from routes.oauth2 import generate_client, update_client
        with open(os.path.join(current_app.root_path, "oauth_clients.json"), "r") as jsonfile:
            data = json.load(jsonfile)
            print("Read successful")
        # print(data["clients"])
        for client_name in data:
            client = data[client_name]
            existing_client = OAuth2Client.query.filter_by(_client_name=client_name).first()
            if (existing_client is None):
                print('Generating client: ' + client_name)
                generate_client(client)
            else:
                update_client(client)
                print('Updating client: ' + client_name)
        return


class OAuth2AuthorizationCode(db.Model, OAuth2AuthorizationCodeMixin):
    __tablename__ = 'oauth2_codes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    user = db.relationship('User')


class OAuth2Token(db.Model, OAuth2TokenMixin):
    __tablename__ = 'oauth2_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    user = db.relationship('User')

    def expires_at(self):
        return self.issued_at + self.expires_in

    def is_refresh_token_active(self):
        if self.revoked:
            return False
        expires_at = self.issued_at + self.expires_in * 2
        return expires_at >= time.time()