from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.user import User
from src.schemas.user import UserSignupRequest, UserResponse, UserSigninRequest, TokenResponse
from src.utils.security import hash_password, verify_password, create_access_token
from src.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new form creator user.
    Hashes passwords using bcrypt before DB persistence.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Hash password and create user model
    hashed_pwd = hash_password(payload.password)
    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/signin", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def signin(payload: UserSigninRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and returns a secure JWT access token.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Sign stateless token storing primary key string in sub claim
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user profile session.
    """
    return current_user
