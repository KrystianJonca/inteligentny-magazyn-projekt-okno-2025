from collections.abc import Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwt

from app.core.config import settings


def setup_auth_middleware(app: FastAPI) -> None:
    """Set up middleware to protect endpoints."""

    @app.middleware("http")
    async def auth_middleware(request: Request, call_next: Callable) -> Response:
        """Middleware to protect endpoints."""

        # Check if the path is public - use exact path or startswith for doc paths
        path = request.url.path
        if (
            path == "/"
            or path == "/auth/login"
            or path == "/auth/register"
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi.json")
        ):
            return await call_next(request)

        # Get the authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract and validate the token
        token = auth_header.replace("Bearer ", "")
        try:
            # Validate the token
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            user_id = payload.get("sub")
            if user_id is None:
                raise JWTError("Missing user ID in token")

            # Check token expiration
            exp = payload.get("exp")
            if exp is None:
                raise JWTError("Missing expiration in token")

            # Add user_id to request state for use in route handlers if needed
            request.state.user_id = user_id

        except JWTError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid or expired token: {str(e)}"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Continue with the request
        return await call_next(request)
