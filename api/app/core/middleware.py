from collections.abc import Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse


def setup_auth_middleware(app: FastAPI) -> None:
    """Set up middleware to protect endpoints."""

    @app.middleware("http")
    async def auth_middleware(request: Request, call_next: Callable) -> Response:
        """Middleware to protect endpoints."""
        # Public paths that don't require authentication
        public_paths = [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/",
            "/auth/login",
            "/auth/register",
        ]

        # Check if the path is public
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

        # Get the authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Continue with the request
        return await call_next(request)
