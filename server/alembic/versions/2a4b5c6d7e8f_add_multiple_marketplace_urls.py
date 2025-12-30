"""add multiple marketplace urls

Revision ID: 2a4b5c6d7e8f
Revises: 0d33384af94b
Create Date: 2025-01-30 11:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2a4b5c6d7e8f'
down_revision = '0d33384af94b'
branch_labels = None
depends_on = None


def upgrade():
    # Add new marketplace URL columns to products table
    op.add_column('products', sa.Column('meesho_url', sa.String(500), nullable=True))
    op.add_column('products', sa.Column('myntra_url', sa.String(500), nullable=True))
    op.add_column('products', sa.Column('nykaa_url', sa.String(500), nullable=True))
    op.add_column('products', sa.Column('jiomart_url', sa.String(500), nullable=True))
    
    # Add new AI verification columns to rewards table
    op.add_column('rewards', sa.Column('ai_decision_log', sa.Text(), nullable=True))
    op.add_column('rewards', sa.Column('is_auto_approved', sa.Boolean(), default=False))


def downgrade():
    # Remove columns if rollback is needed
    op.drop_column('products', 'jiomart_url')
    op.drop_column('products', 'nykaa_url')
    op.drop_column('products', 'myntra_url')
    op.drop_column('products', 'meesho_url')
    
    op.drop_column('rewards', 'is_auto_approved')
    op.drop_column('rewards', 'ai_decision_log')
