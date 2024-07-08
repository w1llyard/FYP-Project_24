import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

class FirebaseHandler:
    def __init__(self, service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        self.db = firestore.client()

    def send_type_counts(self, type_counts):
        """Send typeCounts to Firebase, setting document ID to today's date. If it already exists, increment it."""
        today_str = datetime.today().strftime('%Y-%m-%d')
        doc_ref = self.db.collection("RobotDailyReports").document(today_str)

        try:
            doc = doc_ref.get()
            if doc.exists:
                doc_ref.update({key: firestore.Increment(value) for key, value in type_counts.items()})
            else:
                doc_ref.set(type_counts)
        except Exception as e:
            print(f"An error occurred: {e}")