from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from src.database import Base

class Submission(Base):
    """
    SQLAlchemy database model representing a response submission event for a form.
    """
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # Optional reference if logged in
    responder_name = Column(String(100), nullable=False)
    responder_email = Column(String(120), nullable=False)
    submitted_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    form = relationship("Form", backref="submissions")
    user = relationship("User")
    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")


class Answer(Base):
    """
    SQLAlchemy database model representing a response to a specific form question.
    """
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    value = Column(JSON, nullable=False) # JSON payload capturing input state, e.g. {"text": "Value"}, {"selected": "Option A"}, or {"checked": ["Choice A", "Choice B"]}

    # Relationships
    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question")
