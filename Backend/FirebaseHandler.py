import firebase_admin
from firebase_admin import credentials, firestore, db
from datetime import datetime, timezone


class FirebaseHandler:
    def __init__(self, service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://agribot-96287-default-rtdb.asia-southeast1.firebasedatabase.app'
        })
        self.db = firestore.client()

    def send_type_counts(self, type_counts):
        today_str = datetime.today().strftime('%Y-%m-%d')
        doc_ref = self.db.collection("RobotDailyReports").document(today_str)

        try:
            doc = doc_ref.get()
            if doc.exists:
                doc_ref.update({key: firestore.Increment(value)
                               for key, value in type_counts.items()})
            else:
                doc_ref.set(type_counts)
        except Exception as e:
            print(f"An error occurred: {e}")

    def get_waypoints(self):
        try:
            # Reference to the 'Settings/config' document
            config_ref = self.db.collection('Settings').document('config')
            config_doc = config_ref.get()

            if config_doc.exists:
                # Fetch the 'waypoints' field, which is an array of maps (dictionaries)
                waypoints = config_doc.to_dict().get('waypoints', [])
                if waypoints:
                    print("Waypoints retrieved successfully:")
                    for i, waypoint in enumerate(waypoints):
                        print(
                            f"Waypoint {i}: Latitude = {waypoint['latitude']}, Longitude = {waypoint['longitude']}")
                    return waypoints
                else:
                    print("No waypoints found in the database.")
            else:
                print("No 'config' document found in the 'Settings' collection.")

            return None

        except Exception as e:
            print(f"An error occurred while fetching waypoints: {e}")
            return None
    # Function to fetch compass value from Firebase Realtime Database
    def fetch_compass_db(self):
        try:
            # Reference to the location where compass value is stored
            ref = db.reference('compass/trueNorth')
            compass_value = float(ref.get())
            if compass_value:
                print(f"Compass (True North) Value: {compass_value}")
                return compass_value
            else:
                print("No compass value found")
                return None

        except Exception as e:
            print(f"Error fetching compass value from Firebase: {e}")
            return None

    def fetch_event_for_today(self):
        try:
            today = datetime.now().date()
            events_ref = self.db.collection('Events')
            events_docs = events_ref.get()

            for doc in events_docs:
                event_data = doc.to_dict()

                if event_data.get('completed', False):
                    continue

                event_date = event_data.get('date')
                if event_date:
                    event_date_naive = event_date.astimezone().date()
                else:
                    continue  # Skip if there's no date

                if event_date_naive == today:
                    return True, doc.id

            return False, None
        except Exception as e:
            print(f"An error occurred while fetching events: {e}")
            return False, None

    def mark_event_as_completed(self, event_id):
        try:
            doc_ref = self.db.collection('Events').document(event_id)

            doc_ref.update({'completed': True})

            print(f"Event with ID {event_id} marked as completed.")
            return True
        except Exception as e:
            print(f"An error occurred while updating the event: {e}")
            return False

    def get_ip_addresses(self):
        """Retrieve IP addresses for 'robot' and 'computer' from the 'Settings/IP Address' document in Firestore."""
        try:
            # Reference to the 'Settings/IP Address' document
            doc_ref = self.db.collection('Settings').document('IP Address')
            doc = doc_ref.get()

            if doc.exists:
                ip_data = doc.to_dict()
                robot_ip = ip_data.get('robot', 'No IP found for robot')
                computer_ip = ip_data.get(
                    'computer', 'No IP found for computer')
                return robot_ip, computer_ip

            else:
                print("No 'IP Address' document found in the 'Settings' collection.")
                return None

        except Exception as e:
            print(f"An error occurred while fetching IP addresses: {e}")
            return None
        
