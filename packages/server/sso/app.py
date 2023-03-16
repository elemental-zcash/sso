# from . import db
# from .models import Contact, ContactGroup, Gender

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_marshmallow import Marshmallow
from apifairy import APIFairy

import os

from db import db
from models import User


# app = Flask(__name__)
# db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
apifairy = APIFairy()
ma = Marshmallow()
cors = CORS()

def create_app():
    app = Flask(__name__)
    app.config.from_object(os.environ['APP_SETTINGS'])
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    apifairy.init_app(app)
    ma.init_app(app)
    if app.config['USE_CORS']:
        cors.init_app(app)

    from api.errors import errors
    app.register_blueprint(errors)

    # from api.users import users
    # app.register_blueprint(users, url_prefix='/api')
    from api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    from routes.home import bp as home_bp
    app.register_blueprint(home_bp, url_prefix='')

    return app

# def setup_app(app):
#     # Create tables if they do not exist already
#     @app.before_first_request
#     def create_tables():
#         db.create_all()

#     # db.init_app(app)
#     app.register_blueprint(routes_bp, url_prefix='')

# from models import user

