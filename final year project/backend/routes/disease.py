from flask import Blueprint
from models.disease_model import Disease
from utils.responses import api_success, api_error
from utils.logger import logger

disease_bp = Blueprint('disease_bp', __name__)

@disease_bp.route('/diseases', methods=['GET'])
def get_diseases():
    try:
        diseases = Disease.get_all_diseases()
        return api_success(
            data={'diseases': diseases},
            message="Diseases retrieved successfully",
            status_code=200
        )
    except Exception as e:
        logger.error(f"Error fetching diseases: {e}")
        return api_error(message="Failed to fetch diseases", error="Internal Server Error", status_code=500)

