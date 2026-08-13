from flask import Blueprint, request
from models.prediction_model import Prediction
from models.disease_model import Disease
from utils.jwt_helper import token_required
from ml_model.predictor import predict_disease
from utils.validation import validate_symptoms
from utils.responses import api_success, api_error
from utils.logger import logger

predict_bp = Blueprint('predict_bp', __name__)

@predict_bp.route('/predict', methods=['POST'])
@token_required
def predict(current_user_id):
    data = request.get_json()
    if not isinstance(data, dict):
        return api_error(message="Invalid JSON payload.", status_code=400)

    user_symptoms = data.get('symptoms', [])
    valid_sym, err_sym = validate_symptoms(user_symptoms)
    if not valid_sym:
        return api_error(message=err_sym, status_code=400)

    symptoms_dict = {sym['id']: sym.get('weight', 1.0) for sym in user_symptoms} if isinstance(user_symptoms[0], dict) else {sym: 1.0 for sym in user_symptoms}
    symptoms_list = list(symptoms_dict.keys())

    all_diseases = Disease.get_all_diseases()
    best_disease = None
    conf = 60

    # 1. Scikit-Learn ML Model Prediction
    try:
        ml_res = predict_disease(symptoms_list, symptoms_dict)
        predicted_name = ml_res.get('disease')
        ml_conf = ml_res.get('confidence', 0.5)

        for d in all_diseases:
            if d.get('name', '').strip().lower() == predicted_name.strip().lower():
                best_disease = d
                break
        
        if best_disease:
            conf = min(99, max(50, round(ml_conf * 100)))
    except Exception as e:
        logger.error(f"ML prediction exception: {e}")
        best_disease = None

    # 2. Rule-Based Fallback
    if not best_disease:
        best_score = 0
        for d in all_diseases:
            weighted_matches = 0
            match_count = 0
            for sid in d.get('syms', []):
                if sid in symptoms_dict:
                    weighted_matches += symptoms_dict[sid]
                    match_count += 1
                    
            if match_count >= 1:
                score = weighted_matches / max(1, len(d.get('syms', [])))
                if score > best_score:
                    best_score = score
                    best_disease = d
                    
        if best_disease:
            conf = min(99, max(55, round(best_disease.get('conf', 60) * (0.8 + best_score * 0.2))))
        else:
            best_disease = {
                'name': 'Common Viral Infection',
                'icon': '🤒',
                'sev': 'low',
                'syms': symptoms_list,
                'prec': 'Rest at home, drink plenty of fluids, and monitor symptoms.',
                'meds': ['Paracetamol', 'ORS / Hydration', 'Rest', 'Consult a doctor'],
                'doctor': ['Fever lasting more than 3 days', 'Severe pain or difficulty breathing'],
                'conf': 60
            }
            conf = 60
        
    avg_weight = sum(symptoms_dict.values()) / max(1, len(symptoms_dict))
    display_sev = best_disease.get('sev', best_disease.get('severity', 'low'))
    if avg_weight >= 1.8 and display_sev == 'low':
        display_sev = 'medium'
    elif avg_weight >= 1.8 and display_sev == 'medium':
        display_sev = 'high'
        
    res_payload = {
        'predictedDisease': best_disease,
        'confidence': conf,
        'severity': display_sev
    }
    return api_success(data=res_payload, message="Disease prediction calculated successfully", status_code=200)

@predict_bp.route('/save-prediction', methods=['POST'])
@token_required
def save_prediction(current_user_id):
    data = request.get_json()
    if not isinstance(data, dict):
        return api_error(message="Invalid JSON payload.", status_code=400)

    symptoms = data.get('symptoms')
    predicted_disease = data.get('predictedDisease')
    confidence = data.get('confidence')
    severity = data.get('severity')
    
    if not predicted_disease:
        return api_error(message="Missing prediction data.", status_code=400)
        
    try:
        prediction_id = Prediction.save_prediction(
            user_id=current_user_id,
            symptoms=symptoms,
            predicted_disease=predicted_disease,
            confidence=confidence,
            severity=severity
        )
        return api_success(data={'id': prediction_id}, message="Prediction saved successfully", status_code=201)
    except Exception as e:
        logger.error(f"Error saving prediction: {e}")
        return api_error(message="Failed to save prediction", status_code=500)

@predict_bp.route('/history/<user_id>', methods=['GET'])
@token_required
def get_history(current_user_id, user_id):
    if str(current_user_id) != str(user_id):
        logger.warning(f"Unauthorized history access attempt by {current_user_id} for target {user_id}")
        return api_error(message="Unauthorized to view this history.", error="Forbidden", status_code=403)
        
    try:
        history = Prediction.get_user_history(user_id)
        return api_success(data={'history': history}, message="History retrieved successfully", status_code=200)
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return api_error(message="Failed to fetch history", status_code=500)

