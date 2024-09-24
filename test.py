import time
from flask import Flask, jsonify
import cv2
import numpy as np

app = Flask(__name__)

# Load the Haar Cascade file for face detection
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# Stream URL (e.g., from mjpg-streamer)
stream_url = "http://192.168.56.164:8080/?action=stream"

def detect_faces_in_image(image):
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    # Return the list of detected faces with x, y, w, h
    return faces

@app.route('/detect_faces', methods=['GET'])
def get_faces():
    # Capture the video stream
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        return jsonify({"error": "Cannot open video stream"}), 500
    
    # Read a frame from the stream
    ret, frame = cap.read()

    # Release the stream
    cap.release()

    if not ret:
        return jsonify({"error": "Failed to capture image from stream"}), 500
    
    # Detect faces in the image
    faces = detect_faces_in_image(frame)
    
    # Convert the faces array to a list of dictionaries
    faces_list = [{'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)} for (x, y, w, h) in faces]


    return jsonify(faces_list)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
