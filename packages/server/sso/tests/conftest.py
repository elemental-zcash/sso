import pytest
import os

from app import create_app
from db import db
from models.oauth import OAuth2Client

from config import Config

@pytest.fixture()
def app():
    app = create_app('config.TestingConfig')

    with app.app_context():
        db.create_all()
        if OAuth2Client.query.count() == 0:
            OAuth2Client.insert_clients()

        # other setup can go here

        yield app

        # clean up / reset resources here
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()

class AuthActions(object):
    def __init__(self, client):
        self._client = client

    def login(self, email='test@example.com', password='test12345678'):
        res = self._client.post('/api/users', json={
            "email": email,
            "zcashaddress": "zstest123",
            "password": password
        })
        if (res.status_code == 201):
            oauth_client = OAuth2Client.query.filter_by(client_name='sso-api').first()
            client_id = oauth_client.client_id

            response = self._client.post('/oauth/token', data={
                "grant_type": "password",
                "username": email,
                "password": password,
                "client_id": client_id
            })

            return response.json['access_token']
        else:
            return None

    def logout(self):
        return self._client.get('/auth/logout')

@pytest.fixture()
def auth(client):
    return AuthActions(client)
