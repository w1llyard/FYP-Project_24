import requests
import RPi.GPIO as GPIO
import time

# Set up GPIO using BCM numbering
GPIO.setmode(GPIO.BCM)

# Define the GPIO pins
cameraX_servo_pin = 11  # GPIO pin 17 corresponds to physical pin 11
cameraY_servo_pin = 9  # GPIO pin 18 corresponds to physical pin 12

# Set up the GPIO pins for output
GPIO.setup(cameraX_servo_pin, GPIO.OUT)
GPIO.setup(cameraY_servo_pin, GPIO.OUT)

# Set up PWM for servos
pwm_cameraX = GPIO.PWM(cameraX_servo_pin, 50)  # 50Hz PWM frequency for X axis (pan)
pwm_cameraY = GPIO.PWM(cameraY_servo_pin, 50)  # 50Hz PWM frequency for Y axis (tilt)

def set_servo_angle(pwm, angle):
    duty_cycle = 2.5 + (angle / 180.0) * 10
    pwm.ChangeDutyCycle(duty_cycle)
    time.sleep(0.2)
    pwm.ChangeDutyCycle(0)

# Initialize Pan/Tilt for the camera
cam_pan = 90  - 3  # Center position 90 deg with offsets
cam_tilt = 90 - 25

# Start PWM with neutral position (7.5% duty cycle)
pwm_cameraX.start(7.5)
pwm_cameraY.start(7.5)

# Adjust the initial servo positions
set_servo_angle(pwm_cameraX, cam_pan)
set_servo_angle(pwm_cameraY, cam_tilt)

frame_w = 640
frame_h = 480

# Dead zone size (in pixels)
dead_zone_x = 10
dead_zone_y = 10

def point_camera_to(x, y, w, h):
    global cam_pan, cam_tilt
    sensitivity = 5.0

    face_center_x = x + w // 2
    face_center_y = y + h // 2

    # Calculate the difference between the object center and the frame center
    turn_x = float(face_center_x - (frame_w / 2))
    turn_y = float(face_center_y - (frame_h / 2))

    # Check if the face is centered
    if abs(turn_x) <= dead_zone_x and abs(turn_y) <= dead_zone_y:
        return "centered"

    # Apply dead zone and adjust pan/tilt
    if abs(turn_x) > dead_zone_x:
        turn_x /= float(frame_w / 2)
        turn_x *= sensitivity  # Reduced sensitivity
        cam_pan -= turn_x

    if abs(turn_y) > dead_zone_y:
        turn_y /= float(frame_h / 2)
        turn_y *= sensitivity  # Reduced sensitivity
        cam_tilt -= turn_y

    # Clamp Pan/Tilt to 0 to 180 degrees
    cam_pan = max(0, min(180, cam_pan))
    cam_tilt = max(0, min(180, cam_tilt))

    # Update the servos
    set_servo_angle(pwm_cameraX, cam_pan)
    set_servo_angle(pwm_cameraY, cam_tilt)

    print(f"Pan: {cam_pan} Tilt: {cam_tilt}")

    return "moving"

def track_target():
    status = "moving"
    while status != "centered":

        url = 'http://192.168.56.142:5000/detect_faces'
        response = requests.get(url)

        target = []
        
        if response.status_code == 200:
            target = response.json()
            print("Target detected:", target)
        else:
            print(f"Failed to retrieve data: {response.status_code}")
        

        if len(target) > 0:
            
            x, y, w, h = target[0]["x"], target[0]["y"], target[0]["w"], target[0]["h"]

            # Track the detected object and update status
            status = point_camera_to(x, y, w, h)
            print(status)


try:
    track_target()

finally:
    # Clean up the GPIO
    pwm_cameraX.stop()
    pwm_cameraY.stop()
    GPIO.cleanup()
