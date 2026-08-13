import re

# RFC 5322 compliant email regex
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

# Common weak passwords list
WEAK_PASSWORDS = {"password", "123456", "12345678", "qwerty", "abc123456", "password123", "demo123456"}

def validate_email(email):
    if not email or not isinstance(email, str):
        return False, "Email is required and must be a string."
    email = email.strip()
    if len(email) > 254:
        return False, "Email length cannot exceed 254 characters."
    if not re.match(EMAIL_REGEX, email):
        return False, "Invalid email address format."
    return True, None

def validate_password(password):
    if not password or not isinstance(password, str):
        return False, "Password is required and must be a string."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters."
    if password.lower() in WEAK_PASSWORDS:
        return False, "Password is too weak. Please choose a stronger password."
    return True, None

def validate_name(name, field_name="Name"):
    if not name or not isinstance(name, str):
        return False, f"{field_name} is required and must be a string."
    name = name.strip()
    if len(name) < 1 or len(name) > 50:
        return False, f"{field_name} must be between 1 and 50 characters."
    if not re.match(r"^[a-zA-Z\s'-]+$", name):
        return False, f"{field_name} contains invalid characters."
    return True, None

def validate_age(age):
    if age is None:
        return False, "Age is required."
    try:
        age_int = int(age)
        if age_int < 1 or age_int > 120:
            return False, "Age must be between 1 and 120."
        return True, None
    except (ValueError, TypeError):
        return False, "Age must be a valid integer."

def validate_symptoms(symptoms):
    if not symptoms or not isinstance(symptoms, list):
        return False, "Symptoms must be a non-empty array."
    if len(symptoms) > 50:
        return False, "Too many symptoms selected (max 50)."
    
    for idx, item in enumerate(symptoms):
        if isinstance(item, dict):
            sym_id = item.get('id')
            weight = item.get('weight', 1.0)
            if not sym_id or not isinstance(sym_id, str):
                return False, f"Symptom at index {idx} missing valid 'id'."
            try:
                w_float = float(weight)
                if w_float < 0.5 or w_float > 5.0:
                    return False, f"Symptom weight at index {idx} must be between 0.5 and 5.0."
            except (ValueError, TypeError):
                return False, f"Symptom weight at index {idx} must be numeric."
        elif isinstance(item, str):
            if not item.strip():
                return False, f"Symptom at index {idx} cannot be empty."
        else:
            return False, f"Invalid symptom format at index {idx}."
            
    return True, None

