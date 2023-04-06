"""empty message

Revision ID: dd67492da688
Revises: 756437583b2f
Create Date: 2023-03-17 23:48:42.021723

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dd67492da688'
down_revision = '756437583b2f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('admin',
               existing_type=sa.BOOLEAN(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('admin',
               existing_type=sa.BOOLEAN(),
               nullable=False)

    # ### end Alembic commands ###
