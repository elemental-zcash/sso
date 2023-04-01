"""empty message

Revision ID: 756437583b2f
Revises: 71fba01958c3
Create Date: 2023-03-17 23:33:03.924932

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '756437583b2f'
down_revision = '71fba01958c3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('public_zcashaddress', sa.Text(), nullable=False))
        batch_op.alter_column('password_hash',
               existing_type=sa.VARCHAR(length=128),
               type_=sa.Text(),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('password_hash',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=128),
               nullable=True)
        batch_op.drop_column('public_zcashaddress')

    # ### end Alembic commands ###