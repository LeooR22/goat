"""added column for language preference

Revision ID: df36aeeeaf47
Revises: bf42134df7b8
Create Date: 2022-03-22 10:30:09.429399

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2
import sqlmodel  

from alembic_utils.pg_grant_table import PGGrantTable
from sqlalchemy import text as sql_text

# revision identifiers, used by Alembic.
revision = 'df36aeeeaf47'
down_revision = 'bf42134df7b8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('language_preference', sa.Text(), nullable=True), schema='customer')
    public_distinct_intersection_existing_network_postgres_insert = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='INSERT', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_insert)

    public_distinct_intersection_existing_network_postgres_references = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='REFERENCES', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_references)

    public_distinct_intersection_existing_network_postgres_select = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='SELECT', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_select)

    public_distinct_intersection_existing_network_postgres_update = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='UPDATE', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_update)

    public_distinct_intersection_existing_network_postgres_delete = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='DELETE', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_delete)

    public_distinct_intersection_existing_network_postgres_truncate = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='TRUNCATE', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_truncate)

    public_distinct_intersection_existing_network_postgres_trigger = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='TRIGGER', with_grant_option=True)
    op.drop_entity(public_distinct_intersection_existing_network_postgres_trigger)

    basic_test_postgres_insert = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='INSERT', with_grant_option=True)
    op.drop_entity(basic_test_postgres_insert)

    basic_test_postgres_references = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='REFERENCES', with_grant_option=True)
    op.drop_entity(basic_test_postgres_references)

    basic_test_postgres_select = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='SELECT', with_grant_option=True)
    op.drop_entity(basic_test_postgres_select)

    basic_test_postgres_update = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='UPDATE', with_grant_option=True)
    op.drop_entity(basic_test_postgres_update)

    basic_test_postgres_delete = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='DELETE', with_grant_option=True)
    op.drop_entity(basic_test_postgres_delete)

    basic_test_postgres_truncate = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='TRUNCATE', with_grant_option=True)
    op.drop_entity(basic_test_postgres_truncate)

    basic_test_postgres_trigger = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='TRIGGER', with_grant_option=True)
    op.drop_entity(basic_test_postgres_trigger)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    basic_test_postgres_trigger = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='TRIGGER', with_grant_option=True)
    op.create_entity(basic_test_postgres_trigger)

    basic_test_postgres_truncate = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='TRUNCATE', with_grant_option=True)
    op.create_entity(basic_test_postgres_truncate)

    basic_test_postgres_delete = PGGrantTable(schema='basic', table='test', columns=[], role='postgres', grant='DELETE', with_grant_option=True)
    op.create_entity(basic_test_postgres_delete)

    basic_test_postgres_update = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='UPDATE', with_grant_option=True)
    op.create_entity(basic_test_postgres_update)

    basic_test_postgres_select = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='SELECT', with_grant_option=True)
    op.create_entity(basic_test_postgres_select)

    basic_test_postgres_references = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='REFERENCES', with_grant_option=True)
    op.create_entity(basic_test_postgres_references)

    basic_test_postgres_insert = PGGrantTable(schema='basic', table='test', columns=['id', 'name'], role='postgres', grant='INSERT', with_grant_option=True)
    op.create_entity(basic_test_postgres_insert)

    public_distinct_intersection_existing_network_postgres_trigger = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='TRIGGER', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_trigger)

    public_distinct_intersection_existing_network_postgres_truncate = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='TRUNCATE', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_truncate)

    public_distinct_intersection_existing_network_postgres_delete = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=[], role='postgres', grant='DELETE', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_delete)

    public_distinct_intersection_existing_network_postgres_update = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='UPDATE', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_update)

    public_distinct_intersection_existing_network_postgres_select = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='SELECT', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_select)

    public_distinct_intersection_existing_network_postgres_references = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='REFERENCES', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_references)

    public_distinct_intersection_existing_network_postgres_insert = PGGrantTable(schema='public', table='distinct_intersection_existing_network', columns=['geom', 'id'], role='postgres', grant='INSERT', with_grant_option=True)
    op.create_entity(public_distinct_intersection_existing_network_postgres_insert)

    op.drop_column('user', 'language_preference', schema='customer')
    # ### end Alembic commands ###