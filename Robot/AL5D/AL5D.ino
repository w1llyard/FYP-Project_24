#include "al5d.h"

al5d AL5D;

void setup()
{
    Serial.begin(9600); // Start serial communication at 9600 baud rate
    AL5D.begin();       // Initialize the AL5D robotic arm
}

void loop()
{
    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n'); // Read the data until newline
        input.trim(); // Trim any whitespace
        if (input.length() > 0) {  // Make sure the input is not just a newline
            handleCommand(input); // Handle the input command
        }

        // Clear any remaining data in the serial buffer
        while (Serial.available() > 0) {
            Serial.read(); // Read and discard bytes
        }
    }
    
    delay(1000); // Short delay to prevent overwhelming the serial buffer
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



// #include <SoftwareSerial.h>

// #define RX_PIN 12
// #define TX_PIN 13

// SoftwareSerial mySerial(RX_PIN, TX_PIN); // RX, TX

// void setup() {
//   Serial.begin(9600);    // Start the serial communication with the PC
//   mySerial.begin(9600);  // Start the serial communication with the AL5D

//   Serial.println("Enter commands to move AL5D:");
//   Serial.println("Format: M [servo_number] [position] (e.g., M 1 1500)");
// }

// void loop() {
//   if (Serial.available()) {
//     String input = Serial.readStringUntil('\n');  // Read the input from the Serial Monitor

//     if (input.startsWith("M ")) {  // Check if the command starts with 'M'
//       input.remove(0, 2);  // Remove the 'M ' part

//       int spaceIndex1 = input.indexOf(' ');
//       int servoNumber = input.substring(0, spaceIndex1).toInt();  // Extract servo number

//       int position = input.substring(spaceIndex1 + 1).toInt();  // Extract position

//       if (servoNumber >= 8 && servoNumber <= 13 && position >= 500 && position <= 2500) {
//         String command = "#" + String(servoNumber) + " P" + String(position) + " T1000\r\n";
//         mySerial.print(command);  // Send the command to the AL5D
//         Serial.print("Moving servo ");
//         Serial.print(servoNumber);
//         Serial.print(" to position ");
//         Serial.println(position);
//       } else {
//         Serial.println("Invalid command. Please enter servo number (1-6) and position (500-2500).");
//       }
//     } else {
//       Serial.println("Invalid command. Please start with 'M '.");
//     }
//   }
// }
