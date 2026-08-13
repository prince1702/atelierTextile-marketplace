import os
import json
from flask import Flask
from flask_cors import CORS

from config import Config
from database import init_db, mongo

# Import Blueprints and Models
from routes.auth import auth_bp, bcrypt
from routes.disease import disease_bp
from routes.predict import predict_bp
from models.user_model import User
from models.disease_model import Disease
from models.prediction_model import Prediction
from ml_model.predictor import load_model
from utils.responses import api_success
from utils.error_handlers import register_error_handlers
from utils.logger import logger

app = Flask(__name__)
app.config.from_object(Config)

# 1. Initialize CORS with strict allowed origins
CORS(app, origins=Config.ALLOWED_ORIGINS, supports_credentials=True)

# 2. Initialize Extensions & DB
init_db(app)
bcrypt.init_app(app)

# 3. Register Centralized Error Handlers
register_error_handlers(app)

# 4. Optional Rate Limiting Setup
limiter = None
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[Config.RATELIMIT_DEFAULT],
        storage_uri=Config.RATELIMIT_STORAGE_URI
    )
    logger.info("Flask-Limiter rate limiting initialized successfully.")
except Exception as e:
    logger.warning(f"Flask-Limiter initialization notice: {e}")

# 5. Security Headers Middleware
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# 6. Pre-load Machine Learning Model
load_model()

# 7. Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(disease_bp, url_prefix='/api')
app.register_blueprint(predict_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def health_check():
    return api_success(
        data={"status": "healthy", "service": "MediPredict API"},
        message="MediPredict API is running and secure!",
        status_code=200
    )

def seed_database():
    try:
        if mongo.db.diseases.count_documents({}) == 0:
            seed_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'diseases.json')
            if os.path.exists(seed_file_path):
                with open(seed_file_path, 'r', encoding='utf-8') as f:
                    diseases_data = json.load(f)
                    Disease.seed_diseases(diseases_data)
                    logger.info(f"Successfully seeded {len(diseases_data)} diseases.")
            else:
                logger.warning("diseases.json not found. Skipping seeding.")
    except Exception as e:
        logger.error(f"Error during seeding: {e}")

def init_db_indexes():
    try:
        User.init_indexes()
        Disease.init_indexes()
        Prediction.init_indexes()
        logger.info("Database indexes initialized.")
    except Exception as e:
        logger.error(f"Error initializing indexes: {e}")

if __name__ == '__main__':
    with app.app_context():
        seed_database()
        init_db_indexes()
        
    app.run(port=Config.PORT, debug=Config.DEBUG)

