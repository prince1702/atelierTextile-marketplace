import jwt
import datetime
from functools import wraps
from flask import request
from config import Config
from utils.responses import api_error
from utils.logger import logger

def generate_token(user_id):
    try:
        now = datetime.datetime.utcnow()
        payload = {
            'exp': now + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS),
            'iat': now,
            'nbf': now,
            'iss': 'medipredict-api',
            'sub': str(user_id)
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    except Exception as e:
        logger.error(f"Failed to generate JWT token: {e}")
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            logger.warning(f"Auth failure: Missing Authorization header from {request.remote_addr}")
            return api_error(message="Authentication token is missing.", error="Unauthorized", status_code=401)

        parts = auth_header.strip().split(" ")
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            logger.warning(f"Auth failure: Malformed Authorization header from {request.remote_addr}")
            return api_error(message="Invalid token format. Expected 'Bearer <token>'.", error="Unauthorized", status_code=401)

        token = parts[1]

        try:
            data = jwt.decode(
                token,
                Config.SECRET_KEY,
                algorithms=['HS256'],
                options={"require": ["exp", "iat", "sub", "iss"]}
            )
            
            if data.get('iss') != 'medipredict-api':
                logger.warning(f"Auth failure: Invalid token issuer from {request.remote_addr}")
                return api_error(message="Invalid token issuer.", error="Unauthorized", status_code=401)

            current_user_id = data['sub']
            if not current_user_id:
                return api_error(message="Invalid token payload.", error="Unauthorized", status_code=401)

        except jwt.ExpiredSignatureError:
            logger.warning(f"Auth failure: Token expired for request from {request.remote_addr}")
            return api_error(message="Token has expired. Please log in again.", error="Token Expired", status_code=401)
        except jwt.InvalidTokenError as e:
            logger.warning(f"Auth failure: Invalid token ({str(e)}) from {request.remote_addr}")
            return api_error(message="Token is invalid or corrupted.", error="Invalid Token", status_code=401)
        except Exception as e:
            logger.error(f"Unexpected token verification error: {str(e)}")
            return api_error(message="Token verification failed.", error="Unauthorized", status_code=401)

        return f(current_user_id, *args, **kwargs)
    return decorated

