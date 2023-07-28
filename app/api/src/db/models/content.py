from typing import TYPE_CHECKING
from uuid import UUID

from sqlmodel import (
    ARRAY,
    Column,
    Field,
    ForeignKey,
    Relationship,
    SQLModel,
    Text,
    text,
)

from ._base_class import DateTimeBase, UuidToStr

if TYPE_CHECKING:
    from src.schemas.content import ContentType

    from .layer import Layer
    from .project import Project
    from .report import Report
    from .style import Style
    from .user import User


# TODO: Trigger to update the date when the content is updated
class ContentBase(SQLModel):
    """Base model for content."""

    name: str = Field(sa_column=Column(Text, nullable=False), description="Content name")
    description: str | None = Field(sa_column=Column(Text), description="Content description")
    tags: list[str] | None = Field(
        sa_column=Column(ARRAY(Text()), nullable=True), description="Content tags"
    )
    thumbnail_url: str | None = Field(sa_column=Column(Text), description="Content thumbnail URL")

    @classmethod
    def update_forward_refs(cls):
        from src.schemas.content import ContentType

        super().update_forward_refs(ContentType=ContentType)


content_base_example = {
    "name": "My content",
    "description": "My content description",
    "tags": ["tag1", "tag2"],
    "thumbnail_url": "https://mycontent.com/thumbnail.png",
}


class Content(DateTimeBase, ContentBase, UuidToStr, table=True):
    """Content model."""

    __tablename__ = "content"
    __table_args__ = {"schema": "customer"}

    id: UUID | None = Field(
        sa_column=Column(
            Text, primary_key=True, nullable=False, server_default=text("uuid_generate_v4()")
        )
    )
    content_type: "ContentType" = Field(
        sa_column=Column(Text, nullable=False), description="Content type"
    )
    user_id: UUID = Field(
        sa_column=Column(
            Text,
            ForeignKey("customer.user.id", ondelete="CASCADE"),
            nullable=False,
        ),
        description="Content owner ID",
    )

    # Relationships
    user: "User" = Relationship(back_populates="contents")
    style: "Style" = Relationship(
        back_populates="content", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    project: "Project" = Relationship(
        back_populates="content", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    # layer: "Layer" = Relationship(
    #     back_populates="content", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    # )
    report: "Report" = Relationship(
        back_populates="content", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


ContentBase.update_forward_refs()
Content.update_forward_refs()
