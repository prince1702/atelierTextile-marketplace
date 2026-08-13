import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = FLASK_ENV.lower() == "development"
    
    # Database
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/medipredict")
    
    # Secret Key (Warn if default secret key is used in production)
    _default_secret = "super-secret-jwt-key-medipredict-prod-change-me"
    SECRET_KEY = os.getenv("SECRET_KEY", _default_secret)
    if SECRET_KEY == "default-secret-key" or SECRET_KEY == _default_secret:
        if FLASK_ENV.lower() == "production":
            # Generate a secure ephemeral key if unconfigured in production to prevent static fallback exploit
            SECRET_KEY = secrets.token_hex(32)

    PORT = int(os.getenv("PORT", 5000))
    
    # JWT Expiration in Hours
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", 24))
    
    # Allowed CORS Origins
    _raw_origins = os.getenv("FRONTEND_URL", "http://localhost:5000,http://127.0.0.1:5000,http://localhost:3000,http://127.0.0.1:3000")
    ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
    
    # Rate Limits
    RATELIMIT_DEFAULT = os.getenv("RATELIMIT_DEFAULT", "200 per day;50 per hour")
    RATELIMIT_STORAGE_URI = "memory://"

