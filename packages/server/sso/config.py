import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
  DEBUG = False
  TESTING = False
  CSRF_ENABLED = True
  DISABLE_AUTH = False
  USE_CORS = False
  SECRET_KEY = os.environ['SECRET_KEY']
  CLIENT_SECRETS = {
    'sso-system': os.environ['CLIENT_SECRET_SSO_SYSTEM']
  }
  SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']


class ProductionConfig(Config):
  DEBUG = False
  USE_CORS = True


class StagingConfig(Config):
  DEVELOPMENT = True
  USE_CORS = True
  DEBUG = True


class DevelopmentConfig(Config):
  DEVELOPMENT = True
  DEBUG = True


class TestingConfig(Config):
  TESTING = True
  SECRET_KEY = 'TESTING123'
  CLIENT_SECRETS = {
    'sso-system': 'TESTING1234'
  }
  SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL_TESTING']
