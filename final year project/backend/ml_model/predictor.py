import pickle
import os
import numpy as np

model = None
feature_cols = None

def load_model():
    global model, feature_cols
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    cols_path = os.path.join(os.path.dirname(__file__), 'columns.pkl')
    
    if os.path.exists(model_path) and os.path.exists(cols_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(cols_path, 'rb') as f:
            feature_cols = pickle.load(f)
        print("Scikit-Learn ML Model loaded successfully.")
    else:
        print("WARNING: ML model not found. Please train the model first.")

def predict_disease(symptoms_list, severity_dict=None):
    global model, feature_cols
    if model is None or feature_cols is None:
        load_model()
    if model is None or feature_cols is None:
        raise Exception("Model is not loaded.")
        
    # Construct binary vector (or weighted vector if using severity_dict)
    vector = np.zeros(len(feature_cols))
    
    for i, col in enumerate(feature_cols):
        if col in symptoms_list:
            # If severity provided, we can use it as weight, else binary 1
            if severity_dict and col in severity_dict:
                vector[i] = severity_dict[col]
            else:
                vector[i] = 1.0
                
    # Model expects 2D array
    X_input = vector.reshape(1, -1)
    
    # Predict probabilities
    probs = model.predict_proba(X_input)[0]
    
    # Get highest probability
    max_prob_idx = np.argmax(probs)
    predicted_class = model.classes_[max_prob_idx]
    confidence_score = float(probs[max_prob_idx])
    
    # Optional logic: If confidence is too low, return Common Viral Infection
    if confidence_score < 0.2:
        return {
            "disease": 'Common Viral Infection',
            "confidence": confidence_score
        }
        
    return {
        "disease": predicted_class,
        "confidence": confidence_score
    }
