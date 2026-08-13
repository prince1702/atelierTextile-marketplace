import datetime
from database import mongo
from bson import ObjectId
from bson.errors import InvalidId

class User:
    @staticmethod
    def init_indexes():
        try:
            mongo.db.users.create_index("email", unique=True)
        except Exception as e:
            print(f"User index creation notice: {e}")

    @staticmethod
    def create_user(data):
        if 'email' in data and isinstance(data['email'], str):
            data['email'] = data['email'].strip().lower()
        data['createdAt'] = datetime.datetime.utcnow()
        result = mongo.db.users.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        if not email or not isinstance(email, str):
            return None
        return mongo.db.users.find_one({"email": email.strip().lower()})

    @staticmethod
    def find_by_id(user_id):
        try:
            return mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except (InvalidId, TypeError):
            return None
