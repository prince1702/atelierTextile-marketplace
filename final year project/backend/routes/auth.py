from flask import Blueprint, request
from models.user_model import User
from flask_bcrypt import Bcrypt
from utils.jwt_helper import generate_token
from utils.validation import validate_email, validate_password, validate_name, validate_age
from utils.responses import api_success, api_error
from utils.logger import logger

auth_bp = Blueprint('auth_bp', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not isinstance(data, dict):
        return api_error(message="Invalid JSON payload.", status_code=400)

    first_name = (data.get('firstName') or '').strip()
    last_name = (data.get('lastName') or '').strip()
    email = (data.get('email') or '').strip().lower()
    age = data.get('age')
    password = data.get('password')

    # Input validations
    v_fn, err_fn = validate_name(first_name, "First Name")
    if not v_fn:
        return api_error(message=err_fn, status_code=400)

    v_ln, err_ln = validate_name(last_name, "Last Name")
    if not v_ln:
        return api_error(message=err_ln, status_code=400)

    v_email, err_email = validate_email(email)
    if not v_email:
        return api_error(message=err_email, status_code=400)

    v_age, err_age = validate_age(age)
    if not v_age:
        return api_error(message=err_age, status_code=400)

    v_pass, err_pass = validate_password(password)
    if not v_pass:
        return api_error(message=err_pass, status_code=400)

    if User.find_by_email(email):
        logger.info(f"Registration conflict: Duplicate email attempt for {email}")
        return api_error(message="Email address is already registered.", status_code=409)

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user_data = {
        'firstName': first_name,
        'lastName': last_name,
        'email': email,
        'age': int(age),
        'password': hashed_password
    }
    
    try:
        user_id = User.create_user(user_data)
        token = generate_token(user_id)
        
        logger.info(f"User registered successfully: {user_id}")
        
        return api_success(
            data={
                'token': token,
                'user': {
                    'id': user_id,
                    'firstName': first_name,
                    'lastName': last_name,
                    'email': email
                }
            },
            message="User registered successfully",
            status_code=201
        )
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return api_error(message="Registration failed due to a server error.", status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not isinstance(data, dict):
        return api_error(message="Invalid JSON payload.", status_code=400)

    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return api_error(message="Email and password are required.", status_code=400)

    v_email, err_email = validate_email(email)
    if not v_email:
        return api_error(message=err_email, status_code=400)

    user = User.find_by_email(email)
    
    if not user or not bcrypt.check_password_hash(user['password'], password):
        logger.warning(f"Failed login attempt for email: {email} from {request.remote_addr}")
        return api_error(message="Invalid email or password.", status_code=401)

    token = generate_token(str(user['_id']))
    if not token:
        return api_error(message="Failed to issue authentication token.", status_code=500)

    logger.info(f"Successful login for user ID: {str(user['_id'])}")

    return api_success(
        data={
            'token': token,
            'user': {
                'id': str(user['_id']),
                'firstName': user.get('firstName'),
                'lastName': user.get('lastName'),
                'email': user.get('email')
            }
        },
        message="Login successful",
        status_code=200
    )

