# -*- coding:UTF-8 -*-
import math
import multiprocessing
import requests
import serial
import RPi.GPIO as GPIO
import time
from multiprocessing import Process
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import sys


from FirebaseHandler import FirebaseHandler
from RoboticArm import RoboticArm


app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Global variable to keep track of the auto mode process
auto_mode_process = None
manual_mode_process = None
manual_command_queue = None
current_mode = "auto"  # Track the current mode (auto or manual)


# Definition of motor pin
IN1 = 20
IN2 = 21
IN3 = 19
IN4 = 26
ENA = 16
ENB = 13

# Definition of button
key = 8

# Definition of ultrasonic module pin
EchoPin = 0
TrigPin = 1

# Definition of servo pin
sound_servo_pin = 23
cameraX_servo_pin = 11
cameraY_servo_pin = 9

TIMEOUT = 0.03  # Timeout for echo return in seconds

# Frame size of camera
frame_w = 1280
frame_h = 960

# Dead zone size (in pixels)
dead_zone_x = 20
dead_zone_y = 20

CAM_PAN_OFFSET = 3
CAM_TILT_OFFSET = 25

# Initialize Pan/Tilt for the camera
cam_pan = 90  - CAM_PAN_OFFSET  # Center position 90 deg with offsets
cam_tilt = 90 - CAM_TILT_OFFSET

ARDUINO_PORT='/dev/ttyACM0'
ARDUINO_BAUD_RATE=9600


# Set the GPIO port to BCM encoding mode.
GPIO.setmode(GPIO.BCM)

# Ignore warning information
GPIO.setwarnings(False)

# Motor and servo pins are initialized into output mode
# Key pin is initialized into input mode
# Ultrasonic pin initialization

# Initialize Firebase Handler
firebase_handler = FirebaseHandler('serviceAccountKey.json')

def init():
    global pwm_ENA
    global pwm_ENB
    global pwm_sound_servo
    global pwm_cameraX
    global pwm_cameraY

    GPIO.setup(ENA, GPIO.OUT, initial=GPIO.HIGH)
    GPIO.setup(IN1, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(IN2, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(ENB, GPIO.OUT, initial=GPIO.HIGH)
    GPIO.setup(IN3, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(IN4, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(key, GPIO.IN)
    
    GPIO.setup(EchoPin, GPIO.IN)
    GPIO.setup(TrigPin, GPIO.OUT)

    # Set GPIO pin for the servo signal
    GPIO.setup(sound_servo_pin, GPIO.OUT)
    GPIO.setup(cameraX_servo_pin, GPIO.OUT)
    GPIO.setup(cameraY_servo_pin, GPIO.OUT)

    # Set PWM frequency to 50Hz (20ms period)
    pwm_sound_servo= GPIO.PWM(sound_servo_pin, 50)
    pwm_cameraX = GPIO.PWM(cameraX_servo_pin, 50)  # GPIO 11 for PWM with 50Hz
    pwm_cameraY = GPIO.PWM(cameraY_servo_pin, 50)   # GPIO 9 for PWM with 50Hz

    # Set the PWM pin and frequency is 2000hz
    pwm_ENA = GPIO.PWM(ENA, 2000)
    pwm_ENB = GPIO.PWM(ENB, 2000)

    # Start PWM with 0 duty cycle (off)
    pwm_ENA.start(0)
    pwm_ENB.start(0)

    pwm_sound_servo.start(7.5)
    pwm_cameraX.start(7.5)  # Initial position
    pwm_cameraY.start(7.5)  # Initial position

    set_servo_angle(pwm_sound_servo, 90 - 10)
    set_servo_angle(pwm_cameraX, cam_pan)
    set_servo_angle(pwm_cameraY, cam_tilt)

# Advance
def run(speed):
    GPIO.output(IN1, GPIO.HIGH)
    GPIO.output(IN2, GPIO.LOW)
    GPIO.output(IN3, GPIO.HIGH)
    GPIO.output(IN4, GPIO.LOW)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def back(speed):
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.HIGH)
    GPIO.output(IN3, GPIO.LOW)
    GPIO.output(IN4, GPIO.HIGH)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def left(speed):
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.LOW)
    GPIO.output(IN3, GPIO.HIGH)
    GPIO.output(IN4, GPIO.LOW)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def right(speed):
    GPIO.output(IN1, GPIO.HIGH)
    GPIO.output(IN2, GPIO.LOW)
    GPIO.output(IN3, GPIO.LOW)
    GPIO.output(IN4, GPIO.LOW)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def spin_left(speed):
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.HIGH)
    GPIO.output(IN3, GPIO.HIGH)
    GPIO.output(IN4, GPIO.LOW)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def spin_right(speed):
    GPIO.output(IN1, GPIO.HIGH)
    GPIO.output(IN2, GPIO.LOW)
    GPIO.output(IN3, GPIO.LOW)
    GPIO.output(IN4, GPIO.HIGH)
    pwm_ENA.ChangeDutyCycle(speed)
    pwm_ENB.ChangeDutyCycle(speed)

def brake():
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.LOW)
    GPIO.output(IN3, GPIO.LOW)
    GPIO.output(IN4, GPIO.LOW)

# Button detection
def key_scan():
    while GPIO.input(key):
        pass
    while not GPIO.input(key):
        time.sleep(0.01)
        if not GPIO.input(key):
            time.sleep(0.01)
            while not GPIO.input(key):
                pass

# Ultrasonic function
def measure_distance():
    GPIO.output(TrigPin, GPIO.LOW)
    time.sleep(0.000002)  # Wait for a short period
    GPIO.output(TrigPin, GPIO.HIGH)
    time.sleep(0.000015)  # Trigger pulse duration (15 microseconds)
    GPIO.output(TrigPin, GPIO.LOW)

    start_time = time.time()
    while not GPIO.input(EchoPin):
        if (time.time() - start_time) > TIMEOUT:
            return -1  # Timeout error
    echo_start = time.time()
    while GPIO.input(EchoPin):
        if (time.time() - echo_start) > TIMEOUT:
            return -1  # Timeout error

    echo_end = time.time()
    pulse_duration = echo_end - echo_start
    distance_cm = (pulse_duration * 340 * 100) / 2  
    return distance_cm

def measure_average_distance():
    measurement_count = 0
    valid_distances = []
    max_attempts = 2
    max_distance = 500  # Maximum valid distance in cm
    min_distance = 1    # Minimum valid distance in cm to avoid errors
    while measurement_count < max_attempts:
        distance = measure_distance()
        while distance == -1 or distance >= max_distance or distance < min_distance:
            distance = measure_distance()
        valid_distances.append(distance)
        measurement_count += 1
        time.sleep(0.01)  # Short delay between measurements

    average_distance = sum(valid_distances) / 2
    return average_distance

def set_servo_angle(servo, angle):
    duty = 2.5 + (angle / 180) * 10
    servo.ChangeDutyCycle(duty)
    time.sleep(0.5)  # Reduce sleep time for quicker response
    servo.ChangeDutyCycle(0)  # Stop sending the signal to hold the position

def scan_for_obstacles(direction):
    if direction == "front":
        set_servo_angle(pwm_sound_servo, 90 - 15)
        time.sleep(0.5)
        distance = measure_average_distance()
    elif direction == "left":
        set_servo_angle(pwm_sound_servo, 135)
        time.sleep(0.5)
        distance= measure_average_distance()
    elif direction == "right":
        set_servo_angle(pwm_sound_servo, 20)
        time.sleep(0.5)
        distance = measure_average_distance()
    if direction != "front":
        set_servo_angle(pwm_sound_servo, 90 - 10)
    return distance

def avoid_obstacle():
    THRESHOLD = 15
    TIME_BACKWARD = 0.6
    TIME_TURN = 0.7

    print("Checking for obstacles...")
    distance_front = scan_for_obstacles('front')
    distance_left = scan_for_obstacles('left')
    distance_right = scan_for_obstacles('right')

    if distance_front < THRESHOLD: 
        print(f"Obstacle detected. Avoiding...")
        
        if distance_left > THRESHOLD:
            print("Clear on the left. Moving left...")
            back(30)
            time.sleep(TIME_BACKWARD)
            left(50)
            time.sleep(TIME_TURN)
        
        elif distance_right > THRESHOLD:
            print("Clear on the right. Moving right...")
            back(30)
            time.sleep(TIME_BACKWARD)
            right(50)
            time.sleep(TIME_TURN)
        
        else:
            print("No clear path on the sides. Backing off and spinning left...")
            back(50)
            time.sleep(TIME_BACKWARD)
            spin_left(50)
            time.sleep(TIME_TURN)
        brake()
        time.sleep(0.5)
        return True  # Indicating obstacle was handled

    elif distance_right < THRESHOLD and distance_left > THRESHOLD:
        left(50)
        time.sleep(TIME_TURN)
        brake()
        time.sleep(0.5)
        return True  # Indicating obstacle was handled
    
    elif distance_right > THRESHOLD and distance_left < THRESHOLD:
        right(50)
        time.sleep(TIME_TURN)
        brake()
        time.sleep(0.5)
        return True  # Indicating obstacle was handled

    elif distance_right < THRESHOLD and distance_left < THRESHOLD:
        spin_right(50)
        time.sleep(TIME_TURN)
        brake()
        time.sleep(0.5)
        return True  # Indicating obstacle was handled
    return False  # No obstacle detected

def get_ripeness_detection():    
    try:
        response = requests.post('http://'+ computer_ip + ':5000/tomatodetection')
        if response.status_code == 200:
            target = response.json()
            print("Ripeness detection data retrieved successfully:", target)
            return target
        else:
            print(f"Failed to retrieve data: HTTP {response.status_code}")
            return []
    except Exception as e:
        print(f"An error occurred while making the request: {e}")
        return None
    
def get_defect_detection(bbox):
    url = 'http://'+ computer_ip + ':5000/defectdetection'
    data = {
        'bbox': bbox
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an error for bad responses (4xx or 5xx)

        return response.json()  # Return the JSON response if the request was successful

    except requests.exceptions.RequestException as e:
        print(f"Error sending request: {e}")
        return None

def point_camera_to(x, y, w, h):
    global cam_pan, cam_tilt
    sensitivity = 3.0
    tomato_center_x = x + w // 2
    tomato_center_y = y + h // 2
    turn_x = float(tomato_center_x - (frame_w / 2))
    turn_y = float(tomato_center_y - (frame_h / 2))

    if abs(turn_x) <= dead_zone_x and abs(turn_y) <= dead_zone_y:
        return "centered"

    if abs(turn_x) > dead_zone_x:
        turn_x /= float(frame_w / 2)
        turn_x *= sensitivity  # Reduced sensitivity
        cam_pan -= turn_x

    if abs(turn_y) > dead_zone_y:
        turn_y /= float(frame_h / 2)
        turn_y *= sensitivity  # Reduced sensitivity
        cam_tilt -= turn_y

    cam_pan = max(0, min(180, cam_pan))
    cam_tilt = max(0, min(180, cam_tilt))

    set_servo_angle(pwm_cameraX, cam_pan)
    set_servo_angle(pwm_cameraY, cam_tilt)
    print(f"Pan: {cam_pan} Tilt: {cam_tilt}")
    return "moving"

def track_target():
    status = "moving"
    while status != "centered":
        target = get_ripeness_detection()
        if target["pickSequence"] == []:
            print("No Tomatoes found")
            return False

        target = calculate_box_dimensions(target["pickSequence"])
        if len(target) > 0:
            x, y, w, h = target[0]["x"], target[0]["y"], target[0]["w"], target[0]["h"]
            status = point_camera_to(x, y, w, h)
            print(status)
    
    return True

def calculate_box_dimensions(detections):
    for detection in detections:
        # Extract coordinates of the bounding box
        x1 = detection['box']['x1']
        x2 = detection['box']['x2']
        y1 = detection['box']['y1']
        y2 = detection['box']['y2']

        width = x2 - x1
        height = y2 - y1

        return [{
            'x': x1,
            'y': y1,
            'w': width,
            'h': height
        }]
    
def fetch_from_arduino():
    try:
        
        # Loop until valid data is received
        while True:
            if ser.in_waiting > 0:
                # Read a line from Arduino
                line = ser.readline().decode('utf-8').strip()
                
                # Remove angle brackets and parse the data
                data = line.strip('<>')
                values = data.split(',')
                
                # Check if latitude and longitude are '?'
                if values[0] == '?' or values[1] == '?':
                    # Invalid data, continue to the next iteration of the loop
                    continue
                
                if len(values) != 4:
                    continue

                print(values)
                
                # Convert the data to appropriate types
                try:
                    latitude = float(values[0])
                    longitude = float(values[1])
                    compass_degree = float(values[2])
                    distance = float(values[3])
                    
                    # Check for invalid coordinates (-1, -1)
                    if latitude == -1 and longitude == -1:
                        continue  # Skip if coordinates are invalid
                    
                    # Return the parsed values
                    return latitude, longitude, compass_degree, distance
                
                except ValueError:
                    # Handle case where conversion fails due to bad data
                    continue  # Skip this loop iteration and wait for valid data

    except Exception as e:
        print(f"Error fetching data from Arduino: {e}")
        return None

# Haversine formula
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c * 1000  # returns distance in meters

def course_to(lat1, lon1, lat2, lon2):
    # Convert degrees to radians
    dlon = math.radians(lon2 - lon1)
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    
    # Calculate course
    a1 = math.sin(dlon) * math.cos(lat2)
    a2 = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    a2 = math.atan2(a1, a2)
    
    # Normalize the course to a positive value between 0 and 2*pi
    if a2 < 0.0:
        a2 += 2 * math.pi
    
    # Convert radians to degrees
    return math.degrees(a2)

def angle_difference(current_heading, target_heading):
    diff = (target_heading - current_heading + 180) % 360 - 180
    return diff

def move_to_destination(dest_lat, dest_lon, threshold_distance=8):
    try:
        while True:
            current_data = fetch_from_arduino()
            if current_data is None:
                print("Error fetching data, retrying...")
                continue  # Retry fetching if there's an issue
            
            current_lat, current_lon, current_compass_arduino, _ = current_data
            distance_to_dest = haversine_distance(current_lat, current_lon, dest_lat, dest_lon)
            print(f"Current Distance to destination: {distance_to_dest} m")
            
            if distance_to_dest <= threshold_distance:
                print("Destination reached. Stopping the robot.")
                break
            
            if avoid_obstacle():
                continue  # Retry movement after obstacle is avoided

            while True:
                current_compass_phone = firebase_handler.fetch_compass_db()
                course_angle = course_to(current_lat, current_lon, dest_lat, dest_lon)
                angle_diff = angle_difference(current_compass_phone, course_angle)
                if abs(angle_diff) < 15:
                    print("Moving towards the destination...")
                    run(40)  # Move forward
                    time.sleep(0.5)
                    brake()
                    break 
                elif angle_diff > 0:
                    print(f"Angle difference: {angle_diff}. Adjusting heading: Turning right")
                    spin_right(30)
                else:
                    print(f"Angle difference: {angle_diff}. Adjusting heading: Turning left")
                    spin_left(30)

                time.sleep(0.5)
                brake()
    except Exception as e:
        print(f"Error during navigation: {e}")

def calculate_xyz_tomato(distance, horizontal_angle, vertical_angle):
    
    # Convert angles from degrees to radians
    yaw_rad = math.radians(horizontal_angle)
    pitch_rad = math.radians(vertical_angle)
    
    # Calculate the x, y, z coordinates
    x = distance * math.cos(pitch_rad) * math.cos(yaw_rad)
    y = distance * math.cos(pitch_rad) * math.sin(yaw_rad)
    z = distance * math.sin(pitch_rad)
    
    return x, y, z

def send_command_arduino(command):
    try:
        print(f"Sending command: {command}")
        ser.write((command + '\n').encode())
    except Exception as e:
        print(f"Error sending command to Arduino: {e}")

def move_arm(base, shoulder, wrist):
    command = f"MOVE,{base},{shoulder},{wrist}"
    send_command_arduino(command)

def control_gripper(action):
    command = f"GRIP,{action}"
    send_command_arduino(command)

def harvest_tomato():
    global cam_pan, cam_tilt
    current_data = fetch_from_arduino()
    if current_data is None:
        print("Error fetching data, retrying...")
        return  # Retry fetching if there's an issue

    _, _, _, distance_tomato = current_data

    tomato_x_angle = cam_pan + CAM_PAN_OFFSET - 90
    tomato_y_angle = cam_tilt + CAM_TILT_OFFSET - 90

    x, y, z = calculate_xyz_tomato(distance_tomato, tomato_x_angle, tomato_y_angle)

    result = robot_arm.go_to(x, y, z)

    if result:
        print("Arm positioned to:", result)
        base_angle, shoulder_angle, wrist_angle = result
        move_arm(base_angle, shoulder_angle, wrist_angle)
        time.sleep(2)
        control_gripper("CLOSE")
        time.sleep(2)

        move_arm(90, 90, 45)
        time.sleep(2)
        control_gripper("OPEN")
        time.sleep(2)    
    else:
        print("Error:", robot_arm.get_last_error())

    cam_pan = 90  - CAM_PAN_OFFSET  # Center position 90 deg with offsets
    cam_tilt = 90 - CAM_TILT_OFFSET
    set_servo_angle(pwm_cameraX, cam_pan)
    set_servo_angle(pwm_cameraY, cam_tilt)

# delay 2s
time.sleep(2)
# Open serial connection to Arduino
ser = serial.Serial(ARDUINO_PORT, ARDUINO_BAUD_RATE)
robot_ip, computer_ip = firebase_handler.get_ip_addresses()
robot_arm = RoboticArm()


# Function representing the auto mode operation
def auto_mode():
    try:
        init()
        track_target()
        # Get the corresponding angles for base, shoulder, wrist
        # while True:
        #     found, id = firebase_handler.fetch_event_for_today()
        #     if found == False:
        #         print("No event found")
        #         time.sleep(15)
        #         continue
        #     waypoints = firebase_handler.get_waypoints()
        #     if waypoints:
        #         for waypoint in waypoints:
        #             latitude = waypoint['latitude']
        #             longitude = waypoint['longitude']
        #             print(f"Desired Latitude: {latitude}, Longitude: {longitude}")
        #             move_to_destination(latitude, longitude)
        #             target = get_ripeness_detection()
        #             firebase_handler.send_type_counts(target["typeCounts"])
        #             while track_target():
        #                 target = get_ripeness_detection()
        #                 bbox = calculate_box_dimensions(target["pickSequence"])
        #                 isTomatoGood = get_defect_detection(bbox)
                        # if isTomatoGood:
                        #     harvest_tomato()
                        # else:
                        #     firebase_handler.send_type_counts({"bad":1})
                        #     break

            #     print("Event completed")
            #     firebase_handler.mark_event_as_completed(id)
            #     time.sleep(1)           
            # else:
            #     print("No waypoints found in database")
    finally:
        cleanup()

# Function to start auto mode
def start_auto_mode():
    global current_mode
    global auto_mode_process

    # Stop manual mode if it's running
    stop_manual_mode()

    current_mode = "auto"  # Track the current mode (auto or manual)

    if auto_mode_process and auto_mode_process.is_alive():
        print("Auto mode is already running.")
    else:
        auto_mode_process = Process(target=auto_mode)
        auto_mode_process.start()
        print("Auto mode started.")

# Function to stop auto mode
def stop_auto_mode():
    global current_mode
    current_mode = "manual"  # Track the current mode (auto or manual)
    global auto_mode_process
    if auto_mode_process and auto_mode_process.is_alive():
        auto_mode_process.terminate()
        auto_mode_process.join()
        print("Auto mode stopped.")
        sys.stdout.flush()
    else:
        print("Auto mode is not running.")
        sys.stdout.flush()

# Function to start manual mode
def start_manual_mode():
    global current_mode
    global manual_mode_process
    global manual_command_queue

    # Stop auto mode if it's running
    stop_auto_mode()


    current_mode = 'manual'

    if manual_mode_process and manual_mode_process.is_alive():
        print("Manual mode is already running.")
    else:
        # Create a new Queue for commands
        manual_command_queue = multiprocessing.Queue()
        manual_mode_process = Process(target=manual_mode, args=(manual_command_queue,))
        manual_mode_process.start()
        print("Manual mode started.")

# Function to stop manual mode
def stop_manual_mode():
    global manual_mode_process
    global manual_command_queue
    if manual_mode_process and manual_mode_process.is_alive():
        manual_command_queue.put('stop')  # Signal to stop
        manual_mode_process.join()
        print("Manual mode stopped.")
        sys.stdout.flush()
    else:
        print("Manual mode is not running.")
        sys.stdout.flush()

# Function to get the current mode (auto or manual)
def get_status():
    global current_mode
    return current_mode

def cleanup():
    pwm_ENA.stop()
    pwm_ENB.stop()
    GPIO.cleanup()
    ser.close()

# Flask route to check the current status (auto or manual)
@app.route('/status', methods=['GET'])
def check_status():
    return jsonify({'status': get_status()}), 200

@app.route('/control', methods=['POST'])
def receive_command():
    data = request.get_json()
    if not data or 'command' not in data:
        return jsonify({'error': 'No command provided'}), 400
    command = data['command']
    if command == 'auto':
        start_auto_mode()
        return jsonify({'status': 'Switched to auto mode'}), 200
    elif command == 'manual':
        start_manual_mode()
        return jsonify({'status': 'Switched to manual mode'}), 200
    else:
        if current_mode != 'manual':
            start_manual_mode()
        manual_command_queue.put(command)
        return jsonify({'status': 'Manual command executed', 'command': command}), 200

def manual_mode(command_queue):
    try:
        init()
        print("Manual mode process started.")
        sys.stdout.flush()
        while True:
            command = command_queue.get()
            if command == 'stop':
                print("Stopping manual mode process.")
                sys.stdout.flush()
                break
            print(f"Manual command received: {command}")
            sys.stdout.flush()

            if command == 'left':
                print("Robot moving left ")
                spin_left(30)
                time.sleep(0.5)
                brake()
                time.sleep(0.5)
            elif command == 'right':
                print("Robot moving right ")
                spin_right(30)
                time.sleep(0.5)
                brake()
                time.sleep(0.5)
            elif command == 'forward':
                print("Robot moving forward")
                run(30)
                time.sleep(0.5)
                brake()
                time.sleep(0.5)
            elif command == 'back':
                print("Robot moving backward")
                back(30)
                time.sleep(0.5)
                brake()
                time.sleep(0.5)
            else:
                print("Unknown command")
            sys.stdout.flush()
    finally:
        cleanup()

if __name__ == '__main__':
    # Start auto mode when the script runs

        start_manual_mode()
        # Run the Flask app
        app.run(host='0.0.0.0', port=5000)
