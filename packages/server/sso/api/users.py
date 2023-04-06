from flask import Blueprint, jsonify, request, url_for, abort
from apifairy import authenticate, body, response
from sqlalchemy import select

from app import db

from models.user import User
from auth import token_auth

from api.schemas import UserSchema, UpdateUserSchema, EmptySchema
from api import bp as api
from api.errors import http_error, validation_error
from oauth2 import require_oauth
from authlib.integrations.flask_oauth2 import current_token
from api.decorators import paginated_response
# from app.api.auth import token_auth
# from app.api.errors import bad_request

users = Blueprint('users', __name__)

user_schema = UserSchema()
public_user_schema = UserSchema(exclude=['email'])
users_schema = UserSchema(many=True)
update_user_schema = UpdateUserSchema(partial=True)


@require_oauth()
@api.route('/user_id')
def user_id():
    # current token instance of the OAuth Token model
    print(current_token)
    return current_token

@api.route('/users/<string:id>', methods=['GET'])
# @token_auth.login_required
@response(user_schema)
@require_oauth()
def get_user(id):
    return User.query.filter_by(uuid=id).first() or abort(404)


@api.route('/users', methods=['GET'])
@require_oauth()
@paginated_response(users_schema)
def get_users():
    return select(User)
    # page = request.args.get('page', 1, type=int)
    # per_page = min(request.args.get('per_page', 10, type=int), 100)
    # data = User.to_collection_dict(User.query, page, per_page, 'api.get_users')
    # return jsonify(data)


@api.route('/users/<int:id>/followers', methods=['GET'])
@require_oauth('users')
def get_followers(id):
    user = User.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(user.followers, page, per_page,
                                   'api.get_followers', id=id)
    return jsonify(data)


@api.route('/users/<int:id>/followed', methods=['GET'])
@require_oauth('users')
def get_followed(id):
    user = User.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(user.followed, page, per_page,
                                   'api.get_followed', id=id)
    return jsonify(data)


@api.route('/users', methods=['POST'])
@body(user_schema)
@response(user_schema, 201)
def create_user(args):
    # data = request.get_json() or {}
    # if 'username' not in data or 'email' not in data or 'password' not in data:
    #     return validation_error('ERROR', 'must include username, email and password fields')
    # if User.query.filter_by(username=data['username']).first():
    #     return validation_error('ERROR', 'please use a different username')
    # if User.query.filter_by(email=data['email']).first():
    #     return validation_error('ERROR', 'please use a different email address')
    user = User(**args)
    # user.from_dict(data, new_user=True)
    db.session.add(user)
    db.session.commit()
    # response = jsonify(user.to_dict())
    # response.status_code = 201
    # response.headers['Location'] = url_for('api.get_user', id=user.id)
    return user


@api.route('/users/<int:id>', methods=['PUT'])
@token_auth.login_required
def update_user(id):
    if token_auth.current_user().id != id:
        abort(403)
    user = User.query.get_or_404(id)
    data = request.get_json() or {}
    if 'username' in data and data['username'] != user.username and \
            User.query.filter_by(username=data['username']).first():
        return validation_error('ERROR', 'please use a different username')
    if 'email' in data and data['email'] != user.email and \
            User.query.filter_by(email=data['email']).first():
        return validation_error('ERROR', 'please use a different email address')
    user.from_dict(data, new_user=False)
    db.session.commit()
    return jsonify(user.to_dict())