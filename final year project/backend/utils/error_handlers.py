from flask import jsonify
from utils.responses import api_error
from utils.logger import logger

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request_error(error):
        msg = getattr(error, 'description', 'Bad Request')
        return api_error(message=msg, error="Bad Request", status_code=400)

    @app.errorhandler(401)
    def unauthorized_error(error):
        msg = getattr(error, 'description', 'Unauthorized')
        return api_error(message=msg, error="Unauthorized", status_code=401)

    @app.errorhandler(403)
    def forbidden_error(error):
        msg = getattr(error, 'description', 'Forbidden')
        return api_error(message=msg, error="Forbidden", status_code=403)

    @app.errorhandler(404)
    def not_found_error(error):
        return api_error(message="Requested resource not found", error="Not Found", status_code=404)

    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return api_error(message="Method not allowed for this route", error="Method Not Allowed", status_code=405)

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return api_error(message="Too many requests. Please slow down and try again later.", error="Rate Limit Exceeded", status_code=429)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        logger.error(f"Unhandled Exception: {str(error)}", exc_info=True)
        return api_error(message="An internal server error occurred. Please try again later.", error="Internal Server Error", status_code=500)


