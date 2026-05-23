from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.form import Form, Question
from src.models.user import User
from src.models.submission import Submission, Answer
from src.schemas.submission import SubmissionCreateSchema, SubmissionResponseSchema
from src.utils.auth_deps import get_current_user_optional

router = APIRouter(prefix="/api/v1/forms", tags=["form submissions"])

@router.post("/{id}/submissions", response_model=SubmissionResponseSchema, status_code=status.HTTP_201_CREATED)
def submit_answers(
    id: str,
    payload: SubmissionCreateSchema,
    db: Session = Depends(get_db),
    current_user_opt: User = Depends(get_current_user_optional)
):
    """
    Submits answers for a public form.
    Performs complete relational integrity and validation checks against the form's layout.
    """
    # 1. Fetch form and check if exists and is published
    form = db.query(Form).filter(Form.id == id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
        
    if not form.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This form is currently a draft and is not accepting submissions"
        )

    # Load all questions associated with this form
    questions = {q.id: q for q in form.questions}
    submitted_answers = {ans.question_id: ans for ans in payload.answers}

    # 2. Complete relational and field validation
    for q_id, q in questions.items():
        ans = submitted_answers.get(q_id)
        
        # Check required fields
        if q.is_required:
            if not ans or not ans.value:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Question '{q.question_text}' is required"
                )
            
            # Validate values are non-empty
            val = ans.value
            if q.question_type == "text" and not val.get("text", "").strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Question '{q.question_text}' is required and cannot be empty"
                )
            elif q.question_type == "radio" and not val.get("selected", "").strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Question '{q.question_text}' requires a selection"
                )
            elif q.question_type == "checkbox" and not val.get("checked", []):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Question '{q.question_text}' requires at least one checked option"
                )

        # Skip validation on optional fields that were left empty
        if not ans or not ans.value:
            continue
            
        val = ans.value
        # Type-specific validation
        if q.question_type == "text":
            if "text" not in val or not isinstance(val["text"], str):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid text payload format for Question '{q.question_text}'"
                )
                
        elif q.question_type == "radio":
            selected = val.get("selected")
            if not isinstance(selected, str):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid radio payload format for Question '{q.question_text}'"
                )
            if selected and selected not in q.options:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Option '{selected}' is not a valid choice for Question '{q.question_text}'"
                )
                
        elif q.question_type == "checkbox":
            checked = val.get("checked")
            if not isinstance(checked, list):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid checkbox payload format for Question '{q.question_text}'"
                )
            for item in checked:
                if not isinstance(item, str) or item not in q.options:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Option '{item}' is not a valid choice for Question '{q.question_text}'"
                    )

    # 3. Core DB Persistence
    new_submission = Submission(
        form_id=form.id,
        user_id=current_user_opt.id if current_user_opt else None, # Pre-fill optional creator relationship
        responder_name=payload.responder_name.strip(),
        responder_email=payload.responder_email.strip()
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    # Bulk insert answers matching submission index
    answer_models = []
    for ans_data in payload.answers:
        # Ignore answer payloads that don't map to a valid form question
        if ans_data.question_id not in questions:
            continue
            
        answer_model = Answer(
            submission_id=new_submission.id,
            question_id=ans_data.question_id,
            value=ans_data.value
        )
        answer_models.append(answer_model)
        
    db.add_all(answer_models)
    db.commit()
    
    # Reload submission to include answers mapping
    db.refresh(new_submission)
    return new_submission
