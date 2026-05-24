import os
from urllib.parse import quote_plus, unquote

def sanitize_database_url(url: str) -> str:
    if not url or not url.startswith("postgresql://"):
        return url
    
    prefix = "postgresql://"
    rest = url[len(prefix):]
    
    # Find the last '@' to split userinfo from host/port/database
    if "@" not in rest:
        return url
        
    parts = rest.rsplit("@", 1)
    userinfo = parts[0]
    host_and_rest = parts[1]
    
    # In userinfo, the first ':' splits username from password
    if ":" in userinfo:
        user, password = userinfo.split(":", 1)
        # Quote the password to handle special characters (e.g., '@', ':', etc.)
        # Note: we unquote first to prevent double-encoding if it was already encoded
        unquoted_password = unquote(password)
        quoted_password = quote_plus(unquoted_password)
        sanitized_userinfo = f"{user}:{quoted_password}"
    else:
        sanitized_userinfo = userinfo
        
    return f"{prefix}{sanitized_userinfo}@{host_and_rest}"

raw_db_url = os.getenv("DATABASE_URL", "postgresql://form_user:secure_dev_password@db:5432/form_db")
DATABASE_URL = sanitize_database_url(raw_db_url)

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_local_dev_key_12345")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
