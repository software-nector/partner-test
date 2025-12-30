"""Initial baseline with inventory control

Revision ID: 0d33384af94b
Revises: 
Create Date: 2025-12-27 18:29:56.185198

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '0d33384af94b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create qr_batches table
    op.create_table('qr_batches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('batch_number', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('serial_start', sa.Integer(), nullable=True),
        sa.Column('serial_end', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_qr_batches_id'), 'qr_batches', ['id'], unique=False)

    # 2. Add new columns to products
    op.add_column('products', sa.Column('sku_prefix', sa.String(length=10), nullable=True))
    
    # 3. Add new columns to qr_codes
    op.add_column('qr_codes', sa.Column('batch_id', sa.Integer(), nullable=True))
    op.add_column('qr_codes', sa.Column('serial_number', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_qr_codes_batch', 'qr_codes', 'qr_batches', ['batch_id'], ['id'])

    # 4. Cleanup legacy columns
    # Using try/except in migrations is generally not recommended, 
    # but since these might already be gone (or not), we just perform the drop.
    # Note: On VPS these likely EXIST, so this will clean them up.
    op.drop_column('products', 'selling_price')
    op.drop_column('products', 'mrp')
    
    # 5. Add index to rewards for coupon tracking
    op.create_index(op.f('ix_rewards_coupon_code'), 'rewards', ['coupon_code'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_rewards_coupon_code'), table_name='rewards')
    op.drop_constraint('fk_qr_codes_batch', 'qr_codes', type_='foreignkey')
    op.drop_column('qr_codes', 'serial_number')
    op.drop_column('qr_codes', 'batch_id')
    op.add_column('products', sa.Column('mrp', sa.Float(), nullable=True))
    op.add_column('products', sa.Column('selling_price', sa.Float(), nullable=True))
    op.drop_column('products', 'sku_prefix')
    op.drop_index(op.f('ix_qr_batches_id'), table_name='qr_batches')
    op.drop_table('qr_batches')
