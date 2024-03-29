"""empty message

Revision ID: f8be812b913e
Revises: 49fdbfb5cc3f
Create Date: 2023-03-18 19:38:24.509602

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f8be812b913e'
down_revision = '49fdbfb5cc3f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('joined_on', sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column('last_seen', sa.DateTime(), nullable=False))
        batch_op.drop_column('created')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created', postgresql.TIMESTAMP(), autoincrement=False, nullable=False))
        batch_op.drop_column('last_seen')
        batch_op.drop_column('joined_on')

    # ### end Alembic commands ###
