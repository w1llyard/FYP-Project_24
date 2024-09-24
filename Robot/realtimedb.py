import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# Path to your service account key JSON file
cred = credentials.Certificate('Robot\serviceAccountKey.json')

# Initialize the Firebase app with the database URL
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://agribot-96287-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Function to load data from a specific reference
def load_data_from_firebase(reference_path):
    # Get a reference to the database
    ref = db.reference(reference_path)
    
    # Get the data from the reference
    data = ref.get()
    
    if data:
        print("Data loaded from Firebase:")
        print(data)
    else:
        print("No data found at the specified reference.")

# Example usage: Loading data from 'compass/trueNorth' reference
load_data_from_firebase('compass/trueNorth')
