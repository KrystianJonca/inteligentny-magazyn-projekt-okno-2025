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

        # ✅ Allow CORS preflight requests
        if request.method == "OPTIONS":
            return Response(status_code=200)

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

        # ✅ Check Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header.replace("Bearer ", "")
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            user_id = payload.get("sub")
            if user_id is None:
                raise JWTError("Missing user ID in token")
            exp = payload.get("exp")
            if exp is None:
                raise JWTError("Missing expiration in token")

            request.state.user_id = user_id

        except JWTError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid or expired token: {str(e)}"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        return await call_next(request)

