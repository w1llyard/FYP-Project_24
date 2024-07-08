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
    int thirdComma = data.indexOf(',', secondComma + 1);

    int theta_base = data.substring(0, firstComma).toInt();
    int theta_shoulder = data.substring(firstComma + 1, secondComma).toInt();
    int theta_elbow = data.substring(secondComma + 1, thirdComma).toInt();
    int theta_wrist = data.substring(thirdComma + 1).toInt();

    AL5D.set_motor(8, theta_base);
    AL5D.set_motor(9, theta_shoulder);
    AL5D.set_motor(10, theta_elbow);
    AL5D.set_motor(11, theta_wrist);
    AL5D.move_to_locs();
    Serial.print(AL5D.get_all_motor_positions());
}

void handleGrip(String action) {
    if (action == "OPEN") {
        AL5D.set_motor(12, 0);  // Open position angle
    } else if (action == "CLOSE") {
        AL5D.set_motor(12, 180);  // Close position angle
    }
    AL5D.move_to_locs();
}
