from enum import Enum
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field

from src.db.models.content import Content, ContentBase


class ContentType(str, Enum):
    project = "project"
    layer = "layer"
    report = "report"
    style = "style"


class ContentCreate(ContentBase):
    pass


class ContentUpdateBase(BaseModel):
    name: str | None = Field(None, description="Content name")
    description: str | None = Field(None, description="Content description")
    tags: List[str] | None = Field(None, description="Content tags")
    thumbnail_url: str | None = Field(None, description="Content thumbnail URL")
    owner_id: UUID | None = Field(None, description="Content owner ID")


class ContentUpdate(ContentUpdateBase):
    pass


class ContentRead(Content):
    pass
