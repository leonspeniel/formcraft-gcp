from pydantic import BaseModel, EmailStr, Field
from typing import List, Any, Dict
from datetime import datetime

class AnswerCreateSchema(BaseModel):
    """Schema for validating an individual question response in a submission."""
    question_id: int
    value: Dict[str, Any] = Field(..., description="Captured response payload, e.g. {'text': 'value'} or {'checked': ['option']}")


class SubmissionCreateSchema(BaseModel):
    """Schema for validating submission creation requests."""
    responder_name: str = Field(..., min_length=1, max_length=100, description="Responder name cannot be empty")
    responder_email: EmailStr
    answers: List[AnswerCreateSchema] = Field(..., description="List of responses to form questions")


class AnswerResponseSchema(BaseModel):
    """Schema for serializing question answer records."""
    question_id: int
    value: Dict[str, Any]

    class Config:
        from_attributes = True


class SubmissionResponseSchema(BaseModel):
    """Schema for serializing submission records including nested answers."""
    id: int
    responder_name: str
    responder_email: str
    submitted_at: datetime
    answers: List[AnswerResponseSchema]

    class Config:
        from_attributes = True
