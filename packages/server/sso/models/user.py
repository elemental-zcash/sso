from datetime import datetime, timedelta
from flask import current_app
from flask_login import AnonymousUserMixin, UserMixin
from sqlalchemy.dialects.postgresql import ENUM
from itsdangerous import Serializer, URLSafeTimedSerializer
from itsdangerous import BadSignature, SignatureExpired
from sqlalchemy import orm
from sqlalchemy.ext.hybrid import hybrid_property
from nanoid import generate as nanoid
import secrets

from passlib.hash import argon2

from db import db

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

def generate_nanoid():
    return str(nanoid())

class User(Updateable, db.Model):
    __tablename__ = 'users'

    # __tablename__ = "flasksqlalchemy-tutorial-users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=True)
    joined_on = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
    bio = db.Column(db.Text, nullable=True)
    admin = db.Column(db.Boolean, nullable=True)
    roles = db.relationship(
        'Role',
        secondary=roles,
        backref=db.backref('users', lazy='dynamic')
    )

    tokens: db.WriteOnlyMapped['Token'] = db.relationship(
            back_populates='user')

    uuid = db.Column(db.String(255), unique=True, index=True, default=generate_nanoid)
    email_confirmed = db.Column(db.Boolean, default=False)
    is_confirmed = db.Column(db.Boolean, default=False)
    zcashaddress_confirmed = db.Column(db.Boolean, default=False)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    _email = db.Column('email', db.String(255), unique=True, index=True)
    unverified_email = db.Column(db.String(255), unique=True, index=True)
    _zcashaddress = db.Column('zcashaddress', db.Text, nullable=True)
    unverified_zcashaddress = db.Column(db.Text, nullable=True)
    password_hash = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

    @hybrid_property
    def email(self):
        return self._email
    
    @email.setter
    def email(self, email):
        self.unverified_email = email

    @hybrid_property
    def zcashaddress(self):
        return self._zcashaddress
    
    @zcashaddress.setter
    def zcashaddress(self, zcashaddress):
        self.unverified_zcashaddress = zcashaddress

    @property
    def password(self):
        raise AttributeError('`password` is not a readable attribute')

    def generate_uuid(self):
        if (self.uuid is None):
            self.uuid = nanoid()

    @password.setter
    def password(self, password):
        self.password_hash = argon2.hash(password)

    def verify_password(self, password):
        return argon2.verify(password, self.password_hash)

    def generate_email_confirmation_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        return s.dumps({'confirm_email': self.id}, salt='confirm_email')

    def confirm_email(self, token, expiration=28800):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, max_age=expiration, salt='confirm_email')
        except:
            return False
        if data.get('confirm_email') != self.id:
            return False
        self.is_confirmed = True
        self.email_confirmed = True
        self.email = self.unverified_email
        db.session.add(self)
        return True

    def generate_zcashaddress_confirmation_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        return s.dumps({'confirm_zcashaddress': self.id}, salt='confirm_zcashaddress')


    def confirm_zcashaddress(self, token, expiration=28800):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, max_age=expiration, salt='confirm_zcashaddress')
        except:
            return False
        if data.get('confirm_zcashaddress') != self.id:
            return False
        self.confirmed = True
        db.session.add(self)
        return True

    def generate_reset_password_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        return s.dumps({'reset_password': self.id}, salt='reset_password')

    @staticmethod
    def reset_password(token, new_password, expiration=3600):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, salt='reset_password', max_age=expiration)
        except:
            return False
        user = User.query.get(data.get('reset_password'))
        if user is None:
            return False
        user.password = new_password
        db.session.add(user)
        return True

    def generate_email_change_token(self, new_email):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        return s.dumps(
            {'change_email': self.id, 'new_email': new_email},

        )

    def change_email(self, token, expiration=3600):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token, salt='change_email', max_age=expiration)
        except:
            return False
        if data.get('change_email') != self.id:
            return False
        new_email = data.get('new_email')
        if new_email is None:
            return False
        if self.query.filter_by(email=new_email).first() is not None:
            return False
        self.email = new_email
        self.avatar_hash = self.gravatar_hash()
        db.session.add(self)
        return True

    def get_user_id(self):
        return self.id

    def generate_password_reset_token(self, expiration=3600):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'reset': self.id})

    def has_role(self, name):
        for role in self.roles:
            if role.name == name:
                return True
            return False

    def serialize(self, include_email=False):
        data = {
            'id': self.id,
            'username': self.username,
            # 'last_seen': self.last_seen.isoformat() + 'Z',
            'about_me': self.about_me,
            'post_count': self.posts.count(),
            'follower_count': self.followers.count(),
            'followed_count': self.followed.count(),
            '_links': {
                # 'self': url_for('api.get_user', id=self.id),
                # 'followers': url_for('api.get_followers', id=self.id),
                # 'followed': url_for('api.get_followed', id=self.id),
                'avatar': self.avatar(128)
            }
        }
        if include_email:
            data['email'] = self.email
        return data

    def deserialize(self, data, new_user=False):
        for field in ['username', 'email', 'about_me']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.password = data['password']
        if new_user and 'email' in data:
            self.email = data['email']

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        # if (self.uuid is not None):
        #     self.generate_uuid()
    #     if ('email' in kwargs):
    #         self.unverified_email = kwargs.get('email')
    # def __init__(self, email=""):
    #     # default = Role.query.filter_by(name="default").one()
    #     # self.roles.append(default)
    #     self.email = email

    def __repr__(self):
        return "<User {}>".format(self.uuid)


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