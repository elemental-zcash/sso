import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
  DEBUG = False
  TESTING = False
  CSRF_ENABLED = True
  DISABLE_AUTH = False
  USE_CORS = False
  SECRET_KEY = 'UPDATE_ME'
  CLIENT_SECRETS = {
    'sso-system': 'UPDATE_ME'
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
