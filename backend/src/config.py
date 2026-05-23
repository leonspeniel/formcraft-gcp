import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://form_user:secure_dev_password@db:5432/form_db")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_local_dev_key_12345")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
