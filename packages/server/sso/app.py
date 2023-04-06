# from . import db
# from .models import Contact, ContactGroup, Gender

from flask import Flask, current_app
from flask.cli import with_appcontext
from sqlalchemy import select, text
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_marshmallow import Marshmallow
from apifairy import APIFairy
from dotenv import load_dotenv
import click
import json
import sys
import logging

import os

from db import db
from models import User, OAuth2Client
from oauth2 import config_oauth


# FIXME: This is for Docker, maybe there's a better alternative
os.environ['AUTHLIB_INSECURE_TRANSPORT'] = '1'

# log = logging.getLogger('authlib')
# log.addHandler(logging.StreamHandler(sys.stdout))
# log.setLevel(logging.DEBUG)


# app = Flask(__name__)
# db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
apifairy = APIFairy()
ma = Marshmallow()
cors = CORS()


@click.command()
@with_appcontext
def populate_clients():
    OAuth2Client.insert_clients()

    return

@click.command()
@with_appcontext
def reset_db():
    db.drop_all()

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

    try:
        with app.app_context():
            # db.init_app(app)
            db.session.execute(text('SELECT 1'))
    except Exception as e:
        print('Error connecting to database:', str(e))
        exit(1)

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

    app.cli.add_command(populate_clients, 'populate-clients')
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

