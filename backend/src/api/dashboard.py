from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from src.database import get_db
from src.models.form import Form
from src.models.submission import Submission
from src.models.user import User
from src.schemas.submission import SubmissionResponseSchema
from src.utils.auth_deps import get_current_user

router = APIRouter(tags=["dashboard"])

@router.get("/api/v1/forms/{id}/submissions", response_model=List[SubmissionResponseSchema], status_code=status.HTTP_200_OK)
def get_form_submissions(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all dynamic responses/submissions for a given questionnaire.
    Strictly restricted to the form's owner/creator (RBAC).
    """
    # 1. Fetch form
    form = db.query(Form).filter(Form.id == id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    # 2. Authorization check - only the form creator can access submissions
    if form.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative permissions to view these submissions"
        )

    # 3. Retrieve all submissions associated with the form, ordered by latest
    submissions = db.query(Submission).filter(Submission.form_id == id).order_by(Submission.submitted_at.desc()).all()
    return submissions


@router.get("/api/v1/dashboard/stats", status_code=status.HTTP_200_OK)
def get_creator_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns aggregated metrics and high-level analytical counters for the creator's dashboard panel.
    """
    # 1. Fetch all form ids owned by this creator
    my_forms = db.query(Form).filter(Form.creator_id == current_user.id).all()
    my_form_ids = [f.id for f in my_forms]

    # 2. Calculate counters
    total_forms = len(my_forms)
    
    if not my_form_ids:
        return {
            "total_forms": total_forms,
            "total_submissions": 0,
            "active_forms": 0,
            "recent_submissions_count": 0
        }

    # 3. Fetch submissions count
    total_submissions = db.query(Submission).filter(Submission.form_id.in_(my_form_ids)).count()
    
    # 4. Active (published) forms count
    active_forms = sum(1 for f in my_forms if f.is_published)

    return {
        "total_forms": total_forms,
        "total_submissions": total_submissions,
        "active_forms": active_forms
    }
