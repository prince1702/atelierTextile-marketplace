from flask import jsonify

def api_success(data=None, message="Success", status_code=200):
    payload = {
        "success": True,
        "message": message
    }
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code

def api_error(message="An error occurred", error=None, status_code=400):
    payload = {
        "success": False,
        "message": message
    }
    if error is not None:
        payload["error"] = error
    return jsonify(payload), status_code


