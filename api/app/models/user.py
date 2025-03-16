from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base model for user data."""

    email: EmailStr
    username: str


class UserCreate(UserBase):
    """Model for creating a new user."""

    password: str


class UserRead(UserBase):
    """Model for reading user data."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Model for JWT token."""

    access_token: str
    token_type: str
