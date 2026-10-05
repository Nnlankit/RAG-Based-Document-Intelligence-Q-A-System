"""Security, password hashing, and JWT token authentication module."""

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict, Optional
import bcrypt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.postgres import get_db
from app.database.models import User

logger = logging.getLogger("document_intelligence.core.security")
settings = get_settings()

security_scheme = HTTPBearer(auto_error=False)
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> str:
    """FastAPI dependency: extracts user_id from Bearer JWT if provided, else defaults to 'default_user' for local MVP."""
    if not credentials:
        return "default_user"

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return "default_user"
        return str(user_id)
    except Exception:
        logger.warning("Invalid JWT provided; falling back to default_user in local dev mode.")
        return "default_user"
