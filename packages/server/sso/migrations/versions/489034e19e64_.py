"""empty message

Revision ID: 489034e19e64
Revises: b6b7259707c3
Create Date: 2023-03-30 03:24:30.215730

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '489034e19e64'
down_revision = 'b6b7259707c3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('oauth2_clients', schema=None) as batch_op:
        batch_op.add_column(sa.Column('client_name', sa.String(length=120), nullable=True))

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('login_id', sa.String(length=255), nullable=True))
        batch_op.create_index(batch_op.f('ix_users_login_id'), ['login_id'], unique=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_login_id'))
        batch_op.drop_column('login_id')

    with op.batch_alter_table('oauth2_clients', schema=None) as batch_op:
        batch_op.drop_column('client_name')

    # ### end Alembic commands ###
