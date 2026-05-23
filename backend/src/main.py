from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from src.api.auth import router as auth_router
from src.api.forms import router as forms_router
from src.api.fills import router as fills_router
from src.api.dashboard import router as dashboard_router
import logging

# Configure centralized logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("form-builder-backend")

app = FastAPI(
    title="Form Builder API",
    description="Stateless dual-app form builder and responder service",
    version="1.0.0"
)

# Register endpoints routers
app.include_router(auth_router)
app.include_router(forms_router)
app.include_router(fills_router)
app.include_router(dashboard_router)

# Configure CORS Middleware allowing local development and deployed VM hosts dynamically
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for validation schema mismatches (such as bad datatypes, missing required fields)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation failure: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error occurred", "errors": exc.errors()}
    )

# General internal error interceptor middleware
@app.middleware("http")
async def exception_interceptor_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        logger.error(f"Internal server exception intercepted: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected server error occurred. Please try again later."}
        )

# Base health probes
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "Form Builder API", "version": "1.0.0"}

@app.get("/")
async def root_index():
    return {
        "message": "Welcome to the Form Builder API. Interactive documentation is available at /docs"
    }
