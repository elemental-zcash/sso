from datetime import datetime, timedelta
from app import db
from flask import current_app
from flask_login import AnonymousUserMixin, UserMixin
from sqlalchemy.dialects.postgresql import ENUM
from itsdangerous import Serializer
from itsdangerous import BadSignature, SignatureExpired
from sqlalchemy import orm
import secrets

from passlib.hash import argon2

class Updateable:
    def update(self, data):
        for attr, value in data.items():
            setattr(self, attr, value)

# class Permission(StrEnum):
#   GENERAL = 'GENERAL',
#   ADMIN = 'ADMIN'


# class Role(db.Model):
#   __tablename__ = 'roles'
#   id = db.Column(db.Integer, primary_key=True)
#   name = db.Column(db.String(64), unique=True)
#   index = db.Column(db.String(64))
#   default = db.Column(db.Boolean, default=False, index=True)
#   permissions = db.Column(ENUM('GENERAL', 'ADMIN'))
#   users = db.relationship('User', backref='role', lazy='dynamic')

#   @staticmethod
#   def insert_roles():
#     roles = {
#         'User': (Permission.GENERAL, 'main', True),
#         'Administrator': (
#             Permission.ADMIN,
#             'admin',
#             False  # grants all permissions
#         )
#     }
#     for r in roles:
#         role = Role.query.filter_by(name=r).first()
#         if role is None:
#             role = Role(name=r)
#         role.permissions = roles[r][0]
#         role.index = roles[r][1]
#         role.default = roles[r][2]
#         db.session.add(role)
#     db.session.commit()

#     def __repr__(self):
#         return '<Role \'%s\'>' % self.name

class Token(db.Model):
    __tablename__ = 'tokens'

    id: db.Mapped[int] = db.mapped_column(primary_key=True)
    access_token: db.Mapped[str] = db.mapped_column(db.String(64), index=True)
    access_expiration: db.Mapped[datetime]
    refresh_token: db.Mapped[str] = db.mapped_column(db.String(64), index=True)
    refresh_expiration: db.Mapped[datetime]
    user_id: db.Mapped[int] = db.mapped_column(
        db.ForeignKey('users.id'), index=True)

    user: db.Mapped['User'] = db.relationship(back_populates='tokens')

    def generate(self):
        self.access_token = secrets.token_urlsafe()
        self.access_expiration = datetime.utcnow() + \
            timedelta(minutes=current_app.config['ACCESS_TOKEN_MINUTES'])
        self.refresh_token = secrets.token_urlsafe()
        self.refresh_expiration = datetime.utcnow() + \
            timedelta(days=current_app.config['REFRESH_TOKEN_DAYS'])

    def expire(self, delay=None):
        if delay is None:  # pragma: no branch
            # 5 second delay to allow simultaneous requests
            delay = 5 if not current_app.testing else 0
        self.access_expiration = datetime.utcnow() + timedelta(seconds=delay)
        self.refresh_expiration = datetime.utcnow() + timedelta(seconds=delay)

    @staticmethod
    def clean():
        """Remove any tokens that have been expired for more than a day."""
        yesterday = datetime.utcnow() - timedelta(days=1)
        db.session.execute(Token.delete().where(
            Token.refresh_expiration < yesterday))


roles = db.Table(
    'role_users',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'))
)

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return '<Role {}>'.format(self.name)

class User(Updateable, db.Model):
    """Data model for user accounts."""
    __tablename__ = 'users'

    # __tablename__ = "flasksqlalchemy-tutorial-users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    created = db.Column(db.DateTime, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    admin = db.Column(db.Boolean, nullable=False)
    roles = db.relationship(
        'Role',
        secondary=roles,
        backref=db.backref('users', lazy='dynamic')
    )

    tokens: db.WriteOnlyMapped['Token'] = db.relationship(
            back_populates='user')

    email_confirmed = db.Column(db.Boolean, default=False)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    email = db.Column(db.String(64), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))


    @property
    def password(self):
        raise AttributeError('`password` is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = argon2.hash(password)

    def verify_password(self, password):
        return argon2.verify(self.password_hash, password)

    def generate_confirmation_token(self, expiration=604800):
        """Generate a confirmation token to email a new user."""

        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'confirm': self.id})

    def generate_email_change_token(self, new_email, expiration=3600):
        """Generate an email change token to email an existing user."""
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'change_email': self.id, 'new_email': new_email})

    def generate_password_reset_token(self, expiration=3600):
        """
        Generate a password reset change token to email to an existing user.
        """
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'reset': self.id})

    def has_role(self, name):
        for role in self.roles:
            if role.name == name:
                return True
            return False

    def __init__(self, username=""):
        default = Role.query.filter_by(name="default").one()
        self.roles.append(default)
        self.username = username

    def __repr__(self):
        return "<User {}>".format(self.username)


class AnonymousUser(AnonymousUserMixin):
  def can(self, _):
    return False

  def is_admin(self):
    return False

# id = models.AutoField({ primary_key: true, redisType: 'string' });
#   publicId = models.TextField();
#   name = models.TextField();
#   username = models.TextField();
#   email = models.TextField();
#   totp = models.JSONField();
#   unverifiedEmail = models.TextField();
#   isVerifiedEmail = models.BooleanField();
#   pswd = models.TextField();
#   joinedOn = models.DateTimeField();
#   roles = models.TextArrayField();
#   emailConfirmation = models.JSONField();
#   zcashaddressConfirmation = models.JSONField();
#   bio = models.TextField();
#   socials = models.JSONField();
#   zcashaddress = models.TextField();
#   unverifiedZcashaddress = models.TextField();
#   publicZcashaddress = models.TextField();
#   passwordReset = models.JSONField();

# from sqlalchemy.dialects.postgresql import JSON


# class Result(db.Model):
#     __tablename__ = 'results'

#     id = db.Column(db.Integer, primary_key=True)
#     url = db.Column(db.String())
#     result_all = db.Column(JSON)
#     result_no_stop_words = db.Column(JSON)

#     def __init__(self, url, result_all, result_no_stop_words):
#         self.url = url
#         self.result_all = result_all
#         self.result_no_stop_words = result_no_stop_words

#     def __repr__(self):
#         return '<id {}>'.format(self.id)