import cv2
import base64
import threading
import zmq
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

context = zmq.Context()
zmq_socket = context.socket(zmq.PUB)
zmq_socket.bind("tcp://*:5555")

def capture_frames():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # Send frame to web clients
        socketio.emit('frame', jpg_as_text)

        # Send frame to another client
        zmq_socket.send(jpg_as_text.encode('utf-8'))

        socketio.sleep(0.1)
    cap.release()

@socketio.on('connect')
def on_connect():
    print('Client connected')

if __name__ == '__main__':
    threading.Thread(target=capture_frames).start()
    socketio.run(app, host='0.0.0.0', port=5000)
