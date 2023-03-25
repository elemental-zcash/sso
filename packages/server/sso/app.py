# from . import db
# from .models import Contact, ContactGroup, Gender

from flask import Flask, current_app
from flask.cli import with_appcontext
from sqlalchemy import select
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_marshmallow import Marshmallow
from apifairy import APIFairy
import click
import json

import os

from db import db
from models import User, OAuth2Client
from oauth2 import config_oauth


# app = Flask(__name__)
# db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
apifairy = APIFairy()
ma = Marshmallow()
cors = CORS()


@click.command()
@with_appcontext
def create_clients():
    OAuth2Client.insert_clients()

    return

def create_app(config_name = None):
    app = Flask(__name__)
    app.config.from_object(config_name or os.environ['APP_SETTINGS'])
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    apifairy.init_app(app)
    ma.init_app(app)
    config_oauth(app)
    if app.config['USE_CORS']:
        cors.init_app(app)

    from api.errors import errors
    app.register_blueprint(errors)

    # from api.users import users
    # app.register_blueprint(users, url_prefix='/api')
    from api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # from api.auth import bp as auth_bp
    # app.register_blueprint(auth_bp, url_prefix='/auth')

    from routes.oauth2 import bp as oauth2_bp
    app.register_blueprint(oauth2_bp, url_prefix='')

    from routes.home import bp as home_bp
    app.register_blueprint(home_bp, url_prefix='')

    app.cli.add_command(create_clients, 'create-clients')
    # @app.cli.command("create-clients")
    
    return app

# def setup_app(app):
#     # Create tables if they do not exist already
#     @app.before_first_request
#     def create_tables():
#         db.create_all()

#     # db.init_app(app)
#     app.register_blueprint(routes_bp, url_prefix='')

# from models import user

