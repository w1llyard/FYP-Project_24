import copy
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from CropDetection import RipenessTomatoDetection, TomatoDefectsDetection
from PIL import Image
import constant
from FirebaseHandler import FirebaseHandler
import io
import base64

# Initialize Flask app
app = Flask(__name__)
CORS(app)


firebase_handler = FirebaseHandler('Robot\serviceAccountKey.json')

# Initialize detectors
tomatoDetector = RipenessTomatoDetection(model_path=constant.RIPENESS_TOMATO_DETECTOR_MODEL)
defectDetector = TomatoDefectsDetection(model_path=constant.TOMATO_DEFECTS_DETECTOR_MODEL)

robot_ip, computer_ip = firebase_handler.get_ip_addresses()

# Stream URL (e.g., from mjpg-streamer)
stream_url = "http://" + robot_ip + ":8080/?action=stream"


@app.route('/tomatodetection', methods=['POST'])
def tomatodetection():
    camera = cv2.VideoCapture(stream_url)
    
    if not camera.isOpened():
        return jsonify({'error': 'Could not open camera'}), 500

    frames = []
    number_of_frames = 2  # We want to capture two frames

    for _ in range(number_of_frames):
        ret, frame = camera.read()

        if not ret:
            camera.release()
            return jsonify({'error': 'Failed to capture image from camera'}), 500

        frames.append(frame)

    camera.release()

    images = [Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)) for frame in frames]
    predictions = tomatoDetector.GetPredictions(images)

    last_predictions = [predictions[-1]]
    typeCounts = tomatoDetector.CountTomatoTypes(last_predictions, class_names=constant.RIPENESS_LEVEL_CLASS_NAMES)
    ripeTomatoesPredictions = tomatoDetector.FilterRipeTomatoes(last_predictions)
    pickOrderSequence = tomatoDetector.GetPickOrder(ripeTomatoesPredictions, images[-1].size[1])

    result = {
        "typeCounts": typeCounts,
        "pickSequence": pickOrderSequence,
    }

    return jsonify(result), 200

@app.route('/defectdetection', methods=['POST'])
def defectdetection():
    # Get the bounding box from the request
    bbox = request.json.get('bbox', None)
    
    if bbox is None or len(bbox) != 4:
        return jsonify({'error': 'Invalid or missing bounding box'}), 400

    x, y, w, h = bbox

    camera = cv2.VideoCapture(stream_url)
    
    if not camera.isOpened():
        return jsonify({'error': 'Could not open camera'}), 500

    ret, frame = camera.read()
    if not ret:
        camera.release()
        return jsonify({'error': 'Failed to capture image from camera'}), 500
    
    # Release the camera
    camera.release()

    # Cut out the region defined by the bounding box
    cropped_image = frame[y:y+h, x:x+w]

    # Resize the cropped image to 640x640
    resized_image = cv2.resize(cropped_image, (640, 640))

    # Convert the image for prediction
    image = Image.fromarray(cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB))

    # Get predictions
    predictions = defectDetector.GetPredictions(image)
    isTomatoGood = defectDetector.CheckTomatoQuality(predictions)
    tomatoTypesCount = defectDetector.CountTomatoTypes(predictions, class_names=constant.TOMATO_DEFECTS_CLASS_NAMES)

    # Adjust the type counts
    tomatoTypesCount["bad"] = 1 if tomatoTypesCount["at risk"] > 1 or tomatoTypesCount["rotten"] > 1 else tomatoTypesCount["at risk"]

    results = {
        "isTomatoGood": isTomatoGood,
        "typeCounts": tomatoTypesCount["bad"]
    }

    return jsonify(results), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    # Parse the JSON body of the request
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    # Decode the base64-encoded image
    image_data = data['image'].split(",")[1]  # Remove data:image/...;base64, header if present
    image_bytes = base64.b64decode(image_data)

    # Open the image
    image = Image.open(io.BytesIO(image_bytes))
    predictions = []

    if data['type'] == "defect":
        predictions = defectDetector.GetPredictions(image)
    else:
        predictions = tomatoDetector.GetPredictions(image)
        ripeTomatoesPredictions = tomatoDetector.FilterRipeTomatoes(predictions)
        pickOrderSequenceBest = tomatoDetector.GetPickOrder(copy.deepcopy(ripeTomatoesPredictions), image.size[1])
        pickOrderSequenceAll = tomatoDetector.GetPickOrder(copy.deepcopy(ripeTomatoesPredictions), image.size[1], retrieve_all=True)

    # Return the predictions and pick order (if ripeness) as JSON
    response = {
        "predictions": predictions
    }
    
    # Include pick order sequence if type is not defect
    if data['type'] != "defect":
        response["pick_order_best"] = pickOrderSequenceBest
        response["pick_order_all"] = pickOrderSequenceAll

    print(response)
    return jsonify(response)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run( port=5000, host="0.0.0.0")
