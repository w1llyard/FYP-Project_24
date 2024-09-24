#include <TinyGPS++.h>
#include <NeoSWSerial.h>
#include <HMC5883L.h>  // Include the Compass class
#include <Wire.h>
#include "al5d.h"


// Create instances of the required classes
HMC5883L compass;
TinyGPSPlus gps;         // TinyGPS++ instance
NeoSWSerial GPS1(3, 4);  // NeoSWSerial instance for GPS communication (RX, TX pins)
al5d AL5D;

// Define pins for the Ultrasonic Sensor
const int TrigPin = 9;   // Trigger Pin
const int EchoPin = 10;  // Echo Pin

// Setup function for initialization
void setup() {
  Serial.begin(9600);  // Initialize serial communication for debugging
  AL5D.begin();       // Initialize the AL5D robotic arm
  GPS1.begin(9600);    // Initialize GPS serial communication
  Wire.begin();
  
  // Initialize Initialize HMC5883L
  Serial.println("Initialize HMC5883L");
  while (!compass.begin())
  {
    Serial.println("Could not find a valid HMC5883L sensor, check wiring!");
    delay(500);
  }

  // Set measurement range
  compass.setRange(HMC5883L_RANGE_1_3GA);
  compass.setMeasurementMode(HMC5883L_CONTINOUS);
  compass.setDataRate(HMC5883L_DATARATE_30HZ);
  compass.setSamples(HMC5883L_SAMPLES_8);

  // Initialize the ultrasonic sensor pins
  pinMode(TrigPin, OUTPUT);  // Set the trigger pin as an output
  pinMode(EchoPin, INPUT);   // Set the echo pin as an input
}

// Main loop function
void loop() {
  // Proceed with normal operations after calibration is complete
  Serial.print("<");

  if (updateGPS()) {
    printGPSData();  // Print GPS data if available
  } else {
    Serial.print("?,?");  // Print placeholder if GPS data is not available
  }

  printCompassData();     // Print compass data
  printUltrasoundData();  // Print ultrasound data
  Serial.println(">");

  if (Serial.available() > 0) {
    // Read the data until newline
    String input = Serial.readStringUntil('\n'); 
    input.trim(); // Trim any whitespace
    if (input.length() > 0) {  // Make sure the input is not just a newline
        handleCommand(input); // Handle the input command
    }
    // Clear any remaining data in the serial buffer
    while (Serial.available() > 0) {
        Serial.read(); // Read and discard bytes
    }
  }
  delay(200);  // Delay for 500ms before the next loop iteration
}

// Function to update GPS data
bool updateGPS() {
  while (GPS1.available() > 0) {
    if (gps.encode(GPS1.read())) {
      return true; 
    }
  }
  return false; 
}

// Function to print GPS data
void printGPSData() {
  if (gps.location.isValid()) {
    Serial.print(gps.location.lat(), 6);
    Serial.print(",");
    Serial.print(gps.location.lng(), 6);
  } else {
    Serial.print("-1,-1");  
  }
}

// Function to print compass data
void printCompassData() {  
  Vector norm = compass.readNormalize();

  // Calculate heading
  float heading = atan2(norm.YAxis, norm.ZAxis);
  float declinationAngle = - (18 + (11 / 60.0)) / (180 / M_PI);
  heading += declinationAngle;

  // Correct for heading < 0deg and heading > 360deg
  if (heading < 0)
  {
    heading += 2 * PI;
  }
  if (heading > 2 * PI)
  {
    heading -= 2 * PI;
  }

  // Convert to degrees
  float headingDegrees = heading * 180/M_PI; 
  Serial.print(",");
  Serial.print(headingDegrees);
}

// Function to measure distance using the ultrasonic sensor
float measure_distance() {
  // Trigger the ultrasonic pulse
  digitalWrite(TrigPin, LOW);
  delayMicroseconds(2);  // Wait for a short period
  digitalWrite(TrigPin, HIGH);
  delayMicroseconds(10);  // Trigger pulse duration (10 microseconds)
  digitalWrite(TrigPin, LOW);

  // Wait for the echo start
  unsigned long start_time = micros();
  while (digitalRead(EchoPin) == LOW) {
    if ((micros() - start_time) > 30000) {
      return -1;  // Timeout error
    }
  }

  // Echo pulse started, record time
  unsigned long echo_start = micros();

  // Wait for the echo end
  while (digitalRead(EchoPin) == HIGH) {
    if ((micros() - echo_start) > 30000) {
      return -1;  // Timeout error
    }
  }

  // Echo pulse ended, record time
  unsigned long echo_end = micros();

  // Calculate distance (time difference * speed of sound / 2)
  float pulse_duration = echo_end - echo_start;
  float distance_cm = (pulse_duration * 0.0343) / 2; 

  return distance_cm;
}

// Function to print ultrasound data
void printUltrasoundData() {
  float distance = measure_distance();

  Serial.print(",");
  // Check for timeout error
  if (distance == -1) {
    Serial.print("-1");
  } else {
    Serial.print(distance);
  }
}

void handleCommand(String command) {
    if (command.startsWith("MOVE,")) {
        handleMove(command.substring(5));
    } else if (command.startsWith("GRIP,")) {
        handleGrip(command.substring(5));
    }
}

void handleMove(String data) {
    int firstComma = data.indexOf(',');
    int secondComma = data.indexOf(',', firstComma + 1);

    // Read only 3 values: theta_base, theta_shoulder, and theta_elbow
    int theta_base = data.substring(0, firstComma).toInt();
    int theta_shoulder = data.substring(firstComma + 1, secondComma).toInt();
    int theta_wrist = data.substring(secondComma + 1).toInt();

    // Set motor positions for base, shoulder, and elbow only
    AL5D.set_motor(8, theta_base);
    AL5D.set_motor(9, theta_shoulder);
    AL5D.set_motor(10, theta_wrist);

    // Execute the movement
    AL5D.move_to_locs();
   
}

void handleGrip(String action) {
    if (action == "OPEN") {
        AL5D.set_motor(11, 0);  // Open position angle
    } else if (action == "CLOSE") {
        AL5D.set_motor(11, 180);  // Close position angle
    }
    AL5D.move_to_locs();
}
