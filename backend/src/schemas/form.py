from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from datetime import datetime

class QuestionCreateSchema(BaseModel):
    """Schema for validating individual question creation in a form."""
    question_text: str = Field(..., min_length=1, description="Question text cannot be empty")
    question_type: str = Field(..., description="Must be one of: 'text', 'checkbox', 'radio'")
    is_required: bool = Field(default=False)
    order_index: int = Field(..., ge=0, description="Order index sequence number")
    options: Optional[List[str]] = Field(default=None, description="Choices array for checkbox/radio questions")

    @model_validator(mode="after")
    def validate_options_by_type(self) -> "QuestionCreateSchema":
        q_type = self.question_type.lower()
        if q_type not in ["text", "checkbox", "radio"]:
            raise ValueError("question_type must be either 'text', 'checkbox', or 'radio'")
            
        if q_type in ["checkbox", "radio"]:
            if not self.options or len([o for o in self.options if o.strip()]) == 0:
                raise ValueError(f"Questions of type '{q_type}' require at least one non-empty choice in 'options'")
        else:
            # Text questions do not need options
            self.options = None
        return self


class QuestionResponseSchema(BaseModel):
    """Schema for serializing question database records."""
    id: int
    question_text: str
    question_type: str
    is_required: bool
    order_index: int
    options: Optional[List[str]] = None

    class Config:
        from_attributes = True


class FormCreateSchema(BaseModel):
    """Schema for validating form designer creation requests."""
    title: str = Field(..., min_length=1, max_length=200, description="Form title cannot be empty")
    description: Optional[str] = Field(default=None)
    questions: List[QuestionCreateSchema] = Field(..., min_length=1, description="Forms must contain at least one question")


class FormResponseSchema(BaseModel):
    """Schema for serializing form database profiles including nested questions."""
    id: str
    title: str
    description: Optional[str] = None
    is_published: bool
    created_at: datetime
    questions: List[QuestionResponseSchema]
    submissions_count: int = 0

    class Config:
        from_attributes = True
