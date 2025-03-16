from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import Token, UserCreate, UserRead
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["authentication"])
user_repository = UserRepository()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db_session)):
    """Register a new user."""
    # Check if email already exists
    db_user = await user_repository.get_by_email(db, user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username already exists
    db_user = await user_repository.get_by_username(db, user_data.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Hash the password
    hashed_password = get_password_hash(user_data.password)

    # Create the user
    db_user = await user_repository.create(db, user_data, hashed_password)

    # Return the user without the password
    return UserRead(
        id=db_user.id,
        email=db_user.email,
        username=db_user.username,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at,
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db_session),
):
    """Login a user and return a JWT token."""
    # Try to find the user by username
    user = await user_repository.get_by_username(db, form_data.username)

    # If not found, try by email
    if not user:
        user = await user_repository.get_by_email(db, form_data.username)

    # If still not found or password doesn't match, raise an exception
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create the JWT token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=30),
    )

    # Return the token
    return Token(access_token=access_token, token_type="bearer")
