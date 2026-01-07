"""add link_token to qr_codes

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-01-07 15:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

def upgrade():
    # Add link_token column
    op.add_column('qr_codes', sa.Column('link_token', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_qr_codes_link_token'), 'qr_codes', ['link_token'], unique=True)
    
    # Populate existing rows with random tokens
    connection = op.get_bind()
    qr_codes = connection.execute(sa.text("SELECT id FROM qr_codes")).fetchall()
    
    for row in qr_codes:
        token = uuid.uuid4().hex[:12]
        connection.execute(
            sa.text("UPDATE qr_codes SET link_token = :token WHERE id = :id"),
            {"token": token, "id": row.id}
        )
    
    # After populating, make it non-nullable if desired (optional, keeping it nullable for safety during transition)

def downgrade():
    op.drop_index(op.f('ix_qr_codes_link_token'), table_name='qr_codes')
    op.drop_column('qr_codes', 'link_token')
