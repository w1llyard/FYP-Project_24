#include "HardwareSerial.h"
#include "al5d.h"
SoftwareSerial ssc32u(12, 13);

void al5d::begin() {
  // Initialize the serial connection for SSC-32U
  ssc32u.begin(115200);
  ssc32u.listen();

  // Initialize motor_locs with a neutral position if not already initialized
  for (int i = 0; i < 6; ++i) {
    motor_locs[i] = 1500;  // Set each motor to a neutral start position (1500)
  }

  // Prepare the command string using the values in motor_locs
  char output[256];  // Ensure the buffer is large enough
  sprintf(output, "#8P%u #9P%u #10P%u #11P%u #12P%u #13P%u #15P%u\r",
          motor_locs[0],
          motor_locs[1],
          motor_locs[2],
          motor_locs[3],
          motor_locs[4],
          motor_locs[5]);

  // Send the command string to SSC-32U to set all motors to their initial positions
  ssc32u.write(output);
}

void al5d::set_motor(uint8_t motor_num, int degree) {
  int pulse = (11.1 * degree) + 500;
  if (pulse < 500) {
    pulse = 500;
  } else if (pulse > 2500) {
    pulse = 2500;
  }
  motor_locs[motor_num-8] = pulse;  // Store pulse instead of degree for direct use
}

void al5d::move_to_locs(int time, int speed) {
  char output[256];  // Increase buffer size if necessary
  sprintf(output, "#8P%uS%u #9P%uS%u #10P%uS%u #11P%uS%u #12P%uS%u #13P%uS%uT%u\r",
          motor_locs[0], speed,  // Assuming index 8 corresponds to motor #8 and so on
          motor_locs[1], speed,
          motor_locs[2], speed,
          motor_locs[3], speed,
          motor_locs[4], speed,
          motor_locs[5], speed,
          time);

  ssc32u.write(output);
}
String al5d::get_all_motor_positions(int speed, int time) {
    char output[256];
    sprintf(output, "#8P%uS%u #9P%uS%u #10P%uS%u #11P%uS%u #12P%uS%u #15P%uS%uT%u\r",
                 motor_locs[0], speed,
                 motor_locs[1], speed,
                 motor_locs[2], speed,
                 motor_locs[3], speed,
                 motor_locs[4], speed,
                 motor_locs[5], speed,
                 time);
    return String(output);
}
