"""Add isochrone table without geom

Revision ID: 49039ddc5d7a
Revises: d4867f3a4c0a
Create Date: 2021-07-27 20:35:58.472519

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '49039ddc5d7a'
down_revision = 'd4867f3a4c0a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('isochrone',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('step', sa.Integer(), nullable=False),
    sa.Column('speed', sa.Integer(), nullable=False),
    sa.Column('modus', sa.Integer(), nullable=False),
    sa.Column('object_id', sa.Integer(), nullable=False),
    sa.Column('parent_id', sa.Integer(), nullable=False),
    sa.Column('population', sa.Integer(), nullable=False),
    sa.Column('concavity', sa.Integer(), nullable=False),
    sa.Column('pois', sa.Text(), nullable=True),
    sa.Column('sum_pois_time', sa.Text(), nullable=True),
    sa.Column('sum_pois', sa.Text(), nullable=True),
    sa.Column('starting_point', sa.Text(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('scenario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_isochrone_id'), 'isochrone', ['id'], unique=False)
    op.alter_column('user', 'email',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('user', 'hashed_password',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('user', 'hashed_password',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('user', 'email',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.drop_index(op.f('ix_isochrone_id'), table_name='isochrone')
    op.drop_table('isochrone')
    # ### end Alembic commands ###
