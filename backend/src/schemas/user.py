from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserSignupRequest(BaseModel):
    """Schema for validating user registration requests."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name cannot be empty")

class UserResponse(BaseModel):
    """Schema for serializing user model profiles."""
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserSigninRequest(BaseModel):
    """Schema for validating authentication/login credentials."""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Schema for returning secure JWT session access tokens."""
    access_token: str
    token_type: str = "bearer"
