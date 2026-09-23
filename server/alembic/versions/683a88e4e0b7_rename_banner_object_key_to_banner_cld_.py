"""rename banner_object_key to banner_cld_pub_id

Revision ID: 683a88e4e0b7
Revises: 24a04ed4ecff
Create Date: 2026-09-23 13:48:19.922335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '683a88e4e0b7'
down_revision: Union[str, None] = '24a04ed4ecff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('classes', sa.Column('banner_cld_pub_id', sa.String(length=500), nullable=True))
    op.drop_column('classes', 'banner_object_key')


def downgrade() -> None:
    op.add_column('classes', sa.Column('banner_object_key', sa.VARCHAR(length=500), autoincrement=False, nullable=True))
    op.drop_column('classes', 'banner_cld_pub_id')
