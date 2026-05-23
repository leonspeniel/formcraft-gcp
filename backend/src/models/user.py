from sqlalchemy import Column, Integer, String, DateTime, func
from src.database import Base

class User(Base):
    """
    SQLAlchemy database model representing form creators and registered responders.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
