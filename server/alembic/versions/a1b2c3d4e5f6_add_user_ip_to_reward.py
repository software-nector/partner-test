"""add_user_ip_to_reward

Revision ID: a1b2c3d4e5f6
Revises: 44f1af140c82
Create Date: 2026-01-06 17:18:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '44f1af140c82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add user_ip column to rewards table
    op.add_column('rewards', sa.Column('user_ip', sa.String(length=45), nullable=True))


def downgrade() -> None:
    # Remove user_ip column from rewards table
    op.drop_column('rewards', 'user_ip')
