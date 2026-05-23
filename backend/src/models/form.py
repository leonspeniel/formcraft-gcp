import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from src.database import Base

class Form(Base):
    """
    SQLAlchemy database model representing form entities created by user.
    """
    __tablename__ = "forms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", backref="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index")


class Question(Base):
    """
    SQLAlchemy database model representing dynamic questions belonging to a form.
    """
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), nullable=False) # 'text', 'checkbox', 'radio'
    options = Column(JSON, nullable=True) # JSON list of strings, e.g. ["Option A", "Option B"]
    is_required = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, nullable=False)

    # Relationships
    form = relationship("Form", back_populates="questions")
