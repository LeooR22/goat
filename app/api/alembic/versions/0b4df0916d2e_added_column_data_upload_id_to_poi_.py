"""Added column data_upload_id to poi modified

Revision ID: 0b4df0916d2e
Revises: 3d600e6290fd
Create Date: 2022-03-11 13:28:01.387117

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2
import sqlmodel  



# revision identifiers, used by Alembic.
revision = '0b4df0916d2e'
down_revision = '3d600e6290fd'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('poi_modified', sa.Column('data_upload_id', sa.Integer(), nullable=True), schema='customer')
    op.create_index(op.f('ix_customer_poi_modified_data_upload_id'), 'poi_modified', ['data_upload_id'], unique=False, schema='customer')
    op.create_foreign_key(None, 'poi_modified', 'data_upload', ['data_upload_id'], ['id'], source_schema='customer', referent_schema='customer', ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'poi_modified', schema='customer', type_='foreignkey')
    op.drop_index(op.f('ix_customer_poi_modified_data_upload_id'), table_name='poi_modified', schema='customer')
    op.drop_column('poi_modified', 'data_upload_id', schema='customer')
    # ### end Alembic commands ###