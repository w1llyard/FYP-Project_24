from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import allowed_file
from CropDetection import RipenessTomatoDetection, TomatoDefectsDetection
from PIL import Image
import constant
from FirebaseHandler import FirebaseHandler

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase Handler
firebase_handler = FirebaseHandler('Backend\serviceAccountKey.json')

# Initialize detectors
tomatoDetector = RipenessTomatoDetection(model_path=constant.RIPENESS_TOMATO_DETECTOR_MODEL)
defectDetector = TomatoDefectsDetection(model_path=constant.TOMATO_DEFECTS_DETECTOR_MODEL)

@app.route('/tomatodetection', methods=['POST'])
def tomatodetection():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        image = Image.open(file)
        predictions = tomatoDetector.GetPredictions(image)
        typeCounts = tomatoDetector.CountTomatoTypes(predictions, class_names=constant.RIPENESS_LEVEL_CLASS_NAMES)
        ripeTomatoesPredictions = tomatoDetector.FilterRipeTomatoes(predictions)
        pickOrderSequence = tomatoDetector.GetPickOrder(ripeTomatoesPredictions, image.size[1], retrieve_all=True)

        result = {
            "typeCounts": typeCounts,
            "pickSequence": pickOrderSequence,
        }

        # Send typeCounts to Firebase
        firebase_handler.send_type_counts(typeCounts)

        return jsonify(result), 200
    else:
        return jsonify({'error': 'File type is not allowed'}), 400

@app.route('/defectdetection', methods=['POST'])
def defectdetection():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part in the request'}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No selected files'}), 400
        
    images = []
    for file in files:
        if file and allowed_file(file.filename):
            try:
                image = Image.open(file)
                images.append(image)
            except IOError:
                return jsonify({'error': f'File {file.filename} is not a valid image'}), 400
        else:
            return jsonify({'error': f'File {file.filename} is not allowed'}), 400

    predictions = defectDetector.GetPredictions(images)
    isTomatoGood = defectDetector.CheckTomatoQuality(predictions)
    tomatoTypesCount = defectDetector.CountTomatoTypes(predictions, class_names=constant.TOMATO_DEFECTS_CLASS_NAMES)

    results = {
        "isTomatoGood": isTomatoGood,
    }

    tomatoTypesCount["fresh"] = 1 if isTomatoGood else 0
    tomatoTypesCount["at risk"] = 1 if tomatoTypesCount["at risk"] > 1 else tomatoTypesCount["at risk"]
    tomatoTypesCount["rotten"] = 1 if tomatoTypesCount["bad"] > 1 else tomatoTypesCount["bad"]

    # Send typeCounts to Firebase
    firebase_handler.send_type_counts(tomatoTypesCount)

    return jsonify(results), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
