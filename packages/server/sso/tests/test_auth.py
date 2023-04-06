from base64 import b64encode
from models import User, OAuth2Client

def test_unauthorized(client):
    response = client.get("/api/users")
    assert response.status_code == 401

def test_register_user(client):
    response = client.post("/api/users", json={
        "email": "test1@example.com",
        "zcashaddress": "zstest1",
        "password": "1234567890"
    })

    assert response.status_code == 201

    assert User.query.filter_by(unverified_email="test1@example.com").first() is not None

def test_login_fixture(client, auth):
    access_token = auth.login()

    assert access_token is not None

def test_verify_user(client, email='test2@example.com', password = 'test123456789'):
    new_user_res = client.post("/api/users", json={
        "email": email,
        "zcashaddress": "zstest1",
        "password": password
    })
    user_uuid = new_user_res.json['uuid']

    api_oauth_client = OAuth2Client.query.filter_by(client_name='sso-api').first()
    system_oauth_client = OAuth2Client.query.filter_by(client_name='sso-system').first()
    client_id = api_oauth_client.client_id

    user_token_res = client.post('/oauth/token', data={
        "grant_type": "password",
        "username": email,
        "password": password,
        "client_id": client_id
    })
    system_client_id = system_oauth_client.client_id
    system_client_secret = system_oauth_client.client_secret
    cred_string = system_client_id + ":" + system_client_secret
    credentials = b64encode(cred_string.encode()).decode('utf-8')

    system_token_res = client.post('/oauth/token', data={
        "grant_type": "client_credentials",
        "client_id": system_client_id,
        "client_secret": system_client_secret,
        "scope": "system"
    }, headers={
       'Authorization': f"Basic {credentials}"
    })

    email_confirm_token_response = client.get("/api/auth/confirm/" + user_uuid, headers={
        'Authorization': 'Bearer ' + system_token_res.json['access_token'],
    })

    token = email_confirm_token_response.json['token']

    email_confirm_token_response = client.get("/api/auth/email/confirm/" + token, headers={
        'Authorization': 'Bearer ' + user_token_res.json['access_token'],
    })

    user = User.query.filter_by(uuid=user_uuid).first()

    assert user.email_confirmed is True and user.is_confirmed is True

