from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.models.form import Form, Question
from src.models.user import User
from src.schemas.form import FormCreateSchema, FormResponseSchema
from src.utils.auth_deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/v1/forms", tags=["forms"])

@router.post("", response_model=FormResponseSchema, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Creates and publishes a new dynamic questionnaire form.
    Forms are published automatically upon creation.
    """
    # Create the base form model
    new_form = Form(
        creator_id=current_user.id,
        title=payload.title,
        description=payload.description,
        is_published=True # Published on create as per specification
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    # Bulk save the questions associated with this form
    questions_list = []
    for q_data in payload.questions:
        question_model = Question(
            form_id=new_form.id,
            question_text=q_data.question_text,
            question_type=q_data.question_type,
            options=q_data.options,
            is_required=q_data.is_required,
            order_index=q_data.order_index
        )
        questions_list.append(question_model)
        
    db.add_all(questions_list)
    db.commit()
    
    # Reload form to grab nested questions relationship in order
    db.refresh(new_form)
    return new_form

@router.get("", response_model=List[FormResponseSchema], status_code=status.HTTP_200_OK)
def list_my_forms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a listing of all forms designed and owned by the logged-in creator,
    along with submission counts.
    """
    forms = db.query(Form).filter(Form.creator_id == current_user.id).order_by(Form.created_at.desc()).all()
    
    # Dynamically inject submissions count if submission table or submissions list is available,
    # otherwise default to 0. (Will be integrated fully in submission phases).
    for form in forms:
        # Check if submission table exists in DB and has count
        try:
            from src.models.submission import Submission
            count = db.query(Submission).filter(Submission.form_id == form.id).count()
            form.submissions_count = count
        except Exception:
            form.submissions_count = 0
            
    return forms

@router.get("/{id}", response_model=FormResponseSchema, status_code=status.HTTP_200_OK)
def get_form_schema(id: str, db: Session = Depends(get_db), current_user_opt: User = Depends(get_current_user_optional)):
    """
    Retrieves the structural questions layout of a public form.
    Only accessible publicly if is_published=True.
    Creators can always access their own draft forms.
    """
    form = db.query(Form).filter(Form.id == id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
        
    # Check if the form is unpublished
    if not form.is_published:
        # Creators can always access their own forms
        if not current_user_opt or current_user_opt.id != form.creator_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This form is currently a draft and is not accepting answers"
            )
            
    # Inject submissions count if available
    try:
        from src.models.submission import Submission
        count = db.query(Submission).filter(Submission.form_id == form.id).count()
        form.submissions_count = count
    except Exception:
        form.submissions_count = 0
        
    return form
