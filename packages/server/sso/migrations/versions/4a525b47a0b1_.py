"""empty message

Revision ID: 4a525b47a0b1
Revises: dd67492da688
Create Date: 2023-03-17 23:49:12.245295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a525b47a0b1'
down_revision = 'dd67492da688'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('public_zcashaddress',
               existing_type=sa.TEXT(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('public_zcashaddress',
               existing_type=sa.TEXT(),
               nullable=False)

    # ### end Alembic commands ###