import datetime
from database import mongo
from bson import ObjectId
from bson.errors import InvalidId

class Prediction:
    @staticmethod
    def init_indexes():
        try:
            mongo.db.predictions.create_index([("userId", 1), ("createdAt", -1)])
        except Exception as e:
            print(f"Prediction index creation notice: {e}")

    @staticmethod
    def save_prediction(user_id, symptoms, predicted_disease, confidence, severity):
        try:
            uid = ObjectId(user_id) if user_id else None
        except InvalidId:
            uid = None
        data = {
            "userId": uid,
            "symptoms": symptoms,
            "predictedDisease": predicted_disease,
            "confidence": confidence,
            "severity": severity,
            "createdAt": datetime.datetime.utcnow()
        }
        result = mongo.db.predictions.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def get_user_history(user_id):
        try:
            uid = ObjectId(user_id) if user_id else None
        except InvalidId:
            return []
        if not uid:
            return []
        cursor = mongo.db.predictions.find({"userId": uid}).sort("createdAt", -1)
        history = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['userId'] = str(doc['userId']) if doc.get('userId') else None
            doc['createdAt'] = doc['createdAt'].isoformat() if isinstance(doc.get('createdAt'), datetime.datetime) else str(doc.get('createdAt'))
            history.append(doc)
        return history
