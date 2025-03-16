from typing import TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Parameters for pagination."""

    page: int = 1
    page_size: int = 10


class PageInfo(BaseModel):
    """Information about the current page."""

    total_items: int
    page: int
    page_size: int
    total_pages: int
    has_next_page: bool
