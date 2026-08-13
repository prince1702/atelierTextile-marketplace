from database import mongo

class Disease:
    @staticmethod
    def init_indexes():
        try:
            mongo.db.diseases.create_index("name")
        except Exception as e:
            print(f"Disease index creation notice: {e}")

    @staticmethod
    def get_all_diseases():
        cursor = mongo.db.diseases.find()
        diseases = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            diseases.append(doc)
        return diseases

    @staticmethod
    def seed_diseases(disease_list):
        if mongo.db.diseases.count_documents({}) == 0:
            mongo.db.diseases.insert_many(disease_list)
            return True
        return False
