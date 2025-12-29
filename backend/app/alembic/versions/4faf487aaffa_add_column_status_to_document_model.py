"""add column status to Document model

Revision ID: 4faf487aaffa
Revises: 3f1796cf23c3
Create Date: 2025-12-27 19:38:57.063555

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '4faf487aaffa'
down_revision = '3f1796cf23c3'
branch_labels = None
depends_on = None

def upgrade():
    document_status_enum = sa.Enum(
        "processing",
        "ready",
        "failed",
        name="document_status",
    )

    # ✅ CREATE enum type first
    document_status_enum.create(op.get_bind(), checkfirst=True)

    # ✅ THEN add column
    op.add_column(
        "document",
        sa.Column(
            "status",
            document_status_enum,
            nullable=False,
            server_default="processing",
        ),
    )

    # optional: remove default afterward
    op.alter_column("document", "status", server_default=None)

def downgrade():
    op.drop_column("document", "status")

    document_status_enum = sa.Enum(
        "processing",
        "ready",
        "failed",
        name="document_status",
    )
    document_status_enum.drop(op.get_bind(), checkfirst=True)
