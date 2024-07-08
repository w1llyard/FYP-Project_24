#ifndef AL5D_H
#define AL5D_H
#include <Arduino.h>
#include <SoftwareSerial.h>
class al5d
{
public:
    void begin();
    void set_motor(uint8_t motor_num, int degree);
    void move_to_locs(int time = 1500, int speed = 750);
    String al5d::get_all_motor_positions(int speed =750, int time=1500);

private:
    uint16_t motor_locs[6] = {0, 0, 0, 0, 0, 0};
};
#endif