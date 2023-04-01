from marshmallow import validate, validates, validates_schema, \
    ValidationError, post_dump
from datetime import datetime
from app import ma
from marshmallow import fields
from db import db
from sqlalchemy import select

from auth import token_auth
from models import User

paginated_schema_cache = {}


class EmptySchema(ma.Schema):
    pass


class DateTimePaginationSchema(ma.Schema):
    class Meta:
        ordered = True

    limit = fields.Integer()
    offset = ma.Integer()
    after = ma.DateTime(load_only=True)
    count = ma.Integer(dump_only=True)
    total = ma.Integer(dump_only=True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if data.get('offset') is not None and data.get('after') is not None:
            raise ValidationError('Cannot specify both offset and after')


class StringPaginationSchema(ma.Schema):
    class Meta:
        ordered = True

    limit = ma.Integer()
    offset = ma.Integer()
    after = ma.String(load_only=True)
    count = ma.Integer(dump_only=True)
    total = ma.Integer(dump_only=True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if data.get('offset') is not None and data.get('after') is not None:
            raise ValidationError('Cannot specify both offset and after')


def PaginatedCollection(schema, pagination_schema=StringPaginationSchema):
    if schema in paginated_schema_cache:
        return paginated_schema_cache[schema]

    class PaginatedSchema(ma.Schema):
        class Meta:
            ordered = True

        pagination = ma.Nested(pagination_schema)
        data = ma.Nested(schema, many=True)

    PaginatedSchema.__name__ = 'Paginated{}'.format(schema.__class__.__name__)
    paginated_schema_cache[schema] = PaginatedSchema
    return PaginatedSchema

class LoginSchema(ma.Schema):
    email = fields.Email(required=True, validate=[validate.Length(max=120), validate.Email()])
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8))
    remember_me = fields.Boolean()

class SignupSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        ordered = True
    email = fields.Email(required=True, validate=[validate.Length(max=120), validate.Email()])
    public_zcashaddress = fields.String(required=True, validate=[validate.Length(max=120)])
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8))
    @validates_schema
    def validate_requires(self, data):
        if 'email' in data and 'publicAddress' not in data:
            raise ValidationError('email is required when public zaddress is not set')


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        ordered = True
        # exclude = ["email", "zcashaddress"]

    # id = ma.auto_field(dump_only=True)
    # id = ma.String(dump_only=True, data_key="uuid")
    id = fields.UUID(dump_only=True, attribute='uuid', data_key='id')
    uuid = ma.auto_field(dump_only=True)
    url = ma.String(dump_only=True)
    joined_on = ma.auto_field(dump_only=True)
    last_seen = ma.auto_field(dump_only=True)
    # username = ma.auto_field(
    #     required=True,validate=validate.Length(min=3, max=64)
    # )
    email = ma.String(
        required=True,
        load_only=True,
        validate=[validate.Length(max=120), validate.Email()]
    )
    login_id = ma.String(
        # required=True,
        # load_only=True,
        dump_only=True,
        validate=[validate.Length(min=16), validate.Length(max=16)]
    )
    zcashaddress = ma.String(
        required=True,
        load_only=True,
        validate=[validate.Length(max=255)]
    )
    # unverified_email = ma.auto_field(
    #     required=True,
    #     validate=[validate.Length(max=120), validate.Email()]
    # )
    password = ma.String(
        required=True, load_only=True, validate=validate.Length(min=8)
    )
    avatar_url = ma.String(dump_only=True)
    # about_me = ma.auto_field()
    # first_seen = ma.auto_field(dump_only=True)
    # last_seen = ma.auto_field(dump_only=True)
    # posts_url = ma.URLFor('posts.user_all', values={'id': '<id>'},
    #                       dump_only=True)

    # @validates('username')
    # def validate_username(self, value):
    #     if not value[0].isalpha():
    #         raise ValidationError('Username must start with a letter')
    #     user = token_auth.current_user()
    #     old_username = user.username if user else None
    #     if value != old_username and \
    #             db.session.scalar(User.select().filter_by(username=value)):
    #         raise ValidationError('Use a different username.')

    @validates('email')
    def validate_email(self, value):
        user = token_auth.current_user()
        old_email = user.email if user else None
        if value != old_email and \
                db.session.scalar(select(User).filter_by(email=value)):
            raise ValidationError('Use a different email.')
    @validates('zcashaddress')
    def validate_zcashaddress(self, value):
        user = token_auth.current_user()
        old_email = user.email if user else None
        if value != old_email and \
                db.session.scalar(select(User).filter_by(zcashaddress=value)):
            raise ValidationError('Use a different zcash address.')

    # @post_dump
    # def map_emails(self, data, **kwargs):
    #     # data['id'] = str(data['id'])
    #     data['unverified_zcashaddress'] = data['zcashaddress']
    #     del data['zcashaddress']
    #     data['unverified_email'] = data['email']
    #     del data['email']
    # @post_dump
    # def fix_datetimes(self, data, **kwargs):
    #     if not 'joined_on' in data:
    #         data['joined_on'] = datetime.utcnow()
    #     elif not 'last_seen' in data:
    #         data['last_seen'] = datetime.utcnow()
    #     data['joined_on'] += 'Z'
    #     data['last_seen'] += 'Z'
    #     return data


class UpdateUserSchema(UserSchema):
    old_password = ma.String(load_only=True, validate=validate.Length(min=3))

    @validates('old_password')
    def validate_old_password(self, value):
        if not token_auth.current_user().verify_password(value):
            raise ValidationError('Password is incorrect')


# class PostSchema(ma.SQLAlchemySchema):
#     class Meta:
#         model = Post
#         include_fk = True
#         ordered = True

#     id = ma.auto_field(dump_only=True)
#     url = ma.String(dump_only=True)
#     text = ma.auto_field(required=True, validate=validate.Length(
#         min=1, max=280))
#     timestamp = ma.auto_field(dump_only=True)
#     author = ma.Nested(UserSchema, dump_only=True)

#     @post_dump
#     def fix_datetimes(self, data, **kwargs):
#         data['timestamp'] += 'Z'
#         return data


class TokenSchema(ma.Schema):
    class Meta:
        ordered = True

    access_token = ma.String(required=True)
    refresh_token = ma.String()


class PasswordResetRequestSchema(ma.Schema):
    class Meta:
        ordered = True

    email = ma.String(required=True, validate=[validate.Length(max=120),
                                               validate.Email()])


class PasswordResetSchema(ma.Schema):
    class Meta:
        ordered = True

    token = ma.String(required=True)
    new_password = ma.String(required=True, validate=validate.Length(min=3))