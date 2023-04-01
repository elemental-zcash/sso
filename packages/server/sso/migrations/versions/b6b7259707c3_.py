"""empty message

Revision ID: b6b7259707c3
Revises: 4dc725619b6b
Create Date: 2023-03-19 21:07:12.589481

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b6b7259707c3'
down_revision = '4dc725619b6b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_confirmed', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('zcashaddress_confirmed', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('zcashaddress_confirmed')
        batch_op.drop_column('is_confirmed')

    # ### end Alembic commands ###