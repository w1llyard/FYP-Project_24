import math

import serial

class RoboticArm:
    def __init__(self):
        # Arm dimensions (mm)
        self.BASE_HGT = 0  # Base height to X/Y plane
        self.HUMERUS = 33.3   # Shoulder-to-elbow "bone"
        self.GRIPPER = 12   # Gripper length, to middle of grip surface

        # Joint limits
        self.BAS_MIN = 0.0
        self.BAS_MAX = 180.0
        self.SHL_MIN = 0
        self.SHL_MAX = 115.0
        self.WRI_MIN = 0
        self.WRI_MAX = 180.0
        self.GRI_MIN = 0
        self.GRI_MAX = 180.0

        # Last operation status
        self.last_error = None

    def go_to(self, x, y, z):
        try:
            bas_angle_r = math.atan2(z, x)

            wrist_y = y - self.BASE_HGT
            wrist_x = x

            s_w = wrist_y**2 + wrist_x**2
            s_w_sqrt = math.sqrt(s_w)
            a1 = math.atan2(wrist_y, wrist_x)
            a2 = math.acos((self.HUMERUS**2 - self.GRIPPER**2 +
                           s_w) / (2 * self.HUMERUS * s_w_sqrt))

            shl_angle_r = a1 + a2
            shl_angle_d = math.degrees(shl_angle_r)

            wri_angle_r = math.acos((self.HUMERUS**2 + self.GRIPPER**2 - s_w)
                                    / (2 * self.HUMERUS * self.GRIPPER))
            wri_pos = math.degrees(wri_angle_r) - 90

            bas_pos = 90 + math.degrees(bas_angle_r)

            # Check joint limits
            if any([bas_pos < self.BAS_MIN, bas_pos > self.BAS_MAX,
                    shl_angle_d < self.SHL_MIN, shl_angle_d > self.SHL_MAX,
                    wri_pos < self.WRI_MIN, wri_pos > self.WRI_MAX]):
                raise ValueError("One or more joints are out of limits.")

            self.last_error = None  # Reset error since operation was successful
            return bas_pos, shl_angle_d, wri_pos

        except Exception as e:
            self.last_error = "Cannot go there"
            return None

    def get_last_error(self):
        """Retrieve the last error message."""
        return self.last_error


def move_arm(base, shoulder, wrist):
    """Send a command to move the arm to specified angles."""
    command = f"MOVE,{base},{shoulder},{wrist}"
    send_command_arduino(command)

def control_gripper(action):
    """Control the gripper's action (OPEN, CLOSE)."""
    command = f"GRIP,{action}"
    send_command_arduino(command)

def send_command_arduino(command):
    """Send a command to the Arduino via serial."""
    try:
        # Open serial connection to Arduino
        print(f"Sending command: {command}")
        
        # Send the command
        ser.write((command + '\n').encode())
        

    except Exception as e:
        print(f"Error sending command to Arduino: {e}")

ARDUINO_PORT='COM5'
ARDUINO_BAUD_RATE=9600

ser = serial.Serial(ARDUINO_PORT, ARDUINO_BAUD_RATE)

robot_arm = RoboticArm()

# Main program to allow user input for x, y, z coordinates
while True:
    try:
        # Get user input for x, y, z coordinates
        x = float(input("Enter the X coordinate: "))
        y = float(input("Enter the Y coordinate: "))
        z = float(input("Enter the Z coordinate: "))

        # Get the corresponding angles for base, shoulder, wrist
        result = robot_arm.go_to(x, y, z)

        if result:
            base, shoulder, wrist = result
            move_arm(base, shoulder, wrist)

        # Option to control the gripper
        gripper_action = input("Do you want to OPEN or CLOSE the gripper? (OPEN/CLOSE/none): ").upper()
        if gripper_action in ["OPEN", "CLOSE"]:
            control_gripper(gripper_action)

        # Option to exit the loop
        exit_command = input("Do you want to exit? (yes/no): ").lower()
        if exit_command == 'yes':
            break

    except ValueError:
        print("Invalid input. Please enter numeric values for X, Y, Z coordinates.")

# Close the serial connection
ser.close()




# import math

# class RoboticArm:
#     def __init__(self):
#         # Arm dimensions (mm)
#         self.BASE_HGT = 0  # Base height to X/Y plane
#         self.HUMERUS = 14.8   # Shoulder-to-elbow "bone"
#         self.ULNA = 18.5      # Elbow-to-wrist "bone"
#         self.GRIPPER = 12   # Gripper length, to middle of grip surface
        
#         # Joint limits
#         self.BAS_MIN = 0.0 
#         self.BAS_MAX = 180.0       
#         self.SHL_MIN = 20.0       
#         self.SHL_MAX = 155.0    
#         self.ELB_MIN = 20.0        
#         self.ELB_MAX = 165.0       
#         self.WRI_MIN = 10        
#         self.WRI_MAX = 170.0   
#         self.GRI_MIN = 25.0      
#         self.GRI_MAX = 165.0

#         # Last operation status
#         self.last_error = None

#     def go_to(self, x, y, z, grip_angle_d):
#         """Calculate the necessary servo positions to achieve the desired end effector position."""
#         try:
#             grip_angle_r = math.radians(grip_angle_d)
#             bas_angle_r = math.atan2(z, x)

#             grip_off_y = math.sin(grip_angle_r) * self.GRIPPER
#             grip_off_x = math.cos(grip_angle_r) * self.GRIPPER

#             wrist_y = y - grip_off_y - self.BASE_HGT
#             wrist_x = x - grip_off_x

#             s_w = wrist_y**2 + wrist_x**2
#             s_w_sqrt = math.sqrt(s_w)
#             a1 = math.atan2(wrist_y, wrist_x)
#             a2 = math.acos((self.HUMERUS**2 - self.ULNA**2 + s_w) / (2 * self.HUMERUS * s_w_sqrt))

#             shl_angle_r = a1 + a2
#             shl_angle_d = math.degrees(shl_angle_r)

#             elb_angle_r = math.acos((self.HUMERUS**2 + self.ULNA**2 - s_w) / (2 * self.HUMERUS * self.ULNA))
#             elb_angle_d = math.degrees(elb_angle_r)
#             elb_angle_dn = -(180.0 - elb_angle_d)

#             wri_angle_d = (grip_angle_d - elb_angle_dn) - shl_angle_d

#             bas_pos =90 + math.degrees(bas_angle_r)
#             wri_pos = wri_angle_d + 90

#             # Check joint limits
#             if any([bas_pos < self.BAS_MIN, bas_pos > self.BAS_MAX, shl_angle_d < self.SHL_MIN, shl_angle_d > self.SHL_MAX,
#                     elb_angle_d < self.ELB_MIN, elb_angle_d > self.ELB_MAX, wri_pos < self.WRI_MIN, wri_pos > self.WRI_MAX]):
#                 raise ValueError("One or more joints are out of limits.")

#             self.last_error = None  # Reset error since operation was successful
#             return bas_pos, shl_angle_d, elb_angle_d, wri_pos

#         except Exception as e:
#             self.last_error = str(e)
#             return None

#     def get_last_error(self):
#         """Retrieve the last error message."""
#         return self.last_error

#     def is_successful(self):
#         """Check if the last operation was successful."""
#         return self.last_error is None

# # Example usage:
# import serial
# import time

# # Setup the serial connection
# ser = serial.Serial('COM5', 4800)  # Replace 'COM_PORT' with your actual COM port

# def send_command(command):
#     """Send a command to the Arduino via serial."""
#     ser.write((command + "\n").encode())  # Send command and newline
#     time.sleep(0.1)  # Wait a bit for Arduino to process

# def move_arm(base, shoulder, elbow, wrist):
#     """Send a command to move the arm to specified angles."""
#     command = f"MOVE,{base},{shoulder},{elbow},{wrist}"
#     send_command(command)

# def control_gripper(action):
#     """Control the gripper's action (OPEN, CLOSE)."""
#     command = f"GRIP,{action}"
#     send_command(command)

# # Example of using the RoboticArm class
# robot_arm = RoboticArm()
# result = robot_arm.go_to(20, 10, 0, 0)

# if result:
#     print("Arm positioned to:", result)
#     base_angle, shoulder_angle, elbow_angle, wrist_angle = result
#     move_arm(base_angle, shoulder_angle, elbow_angle, wrist_angle)