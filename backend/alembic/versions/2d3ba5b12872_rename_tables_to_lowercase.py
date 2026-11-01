"""rename tables to lowercase

Revision ID: 2d3ba5b12872
Revises: 48751729219e
Create Date: 2026-07-01 12:16:33.339964

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d3ba5b12872'
down_revision: Union[str, Sequence[str], None] = '48751729219e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("Kanji", "kanji")
    op.rename_table("Users", "user_profiles")
    op.rename_table("UserKanji", "user_kanji")
    op.rename_table("ReviewLog", "review_log")


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table("kanji", "Kanji")
    op.rename_table("user_profiles", "Users")
    op.rename_table("user_kanji", "UserKanji")
    op.rename_table("review_log", "ReviewLog")