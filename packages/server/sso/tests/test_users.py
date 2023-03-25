# def test_request_example(client):
#     response = client.get("/api/users")
#     print(response)
#     assert b"<h2>Hello, World!</h2>" in response.status
from models.oauth import OAuth2Client
from models.user import User
from db import db


def test_login_invalid_user(client):
    oauth_client = OAuth2Client.query.filter_by(client_name='sso-api').first()
    client_id = oauth_client.client_id
    print({ "client_id": client_id, "grant_types": oauth_client.grant_types })

    response = client.post('/oauth/token', data={
        "grant_type": "password",
        "username": "test1@example.com",
        "password": "1234567890",
        "client_id": client_id
    })
# {
#     "access_token": "123abc",
#     "expires_in": 864000,
#     "token_type": "Bearer"
# }
    assert response.json['error_description'] == 'Invalid "username" or "password" in request.'


def test_get_users(client, auth):
    access_token = auth.login()

    response = client.get("/api/users", headers={
        'Authorization': 'Bearer ' + access_token,
    })

    assert response.status_code == 200

# def test_verify_user(client, auth):
#     access_token = auth.login()

#     response = client.get("/auth/users", headers={
#         'Authorization': 'Bearer ' + access_token,
#     })
