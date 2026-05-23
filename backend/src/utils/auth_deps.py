from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.database import get_db
from src.utils.security import decode_access_token

# Define OAuth2 bearer scheme pointing to our signin endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency resolver that extracts the access token, decodes it, 
    and returns the corresponding database User model.
    Raises 401 Unauthorized if authentication fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
        
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    # Late import to prevent circular dependency issues
    from src.models.user import User
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_user_optional(token: str | None = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    """
    Dependency resolver that returns the authenticated database User model if a valid token 
    is supplied. If no token is provided or if the token is invalid, returns None.
    Never raises an HTTP exception, supporting optional/public access flows.
    """
    if not token:
        return None
        
    payload = decode_access_token(token)
    if payload is None:
        return None
        
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        return None
        
    try:
        user_id = int(user_id_str)
    except ValueError:
        return None

    # Late import to prevent circular dependency issues
    from src.models.user import User
    
    return db.query(User).filter(User.id == user_id).first()
