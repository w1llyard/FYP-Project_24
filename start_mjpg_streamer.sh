#!/bin/bash
cd mjpg-streamer/mjpg-streamer-experimental
./mjpg_streamer -i "./plugins/input_uvc/input_uvc.so -r 1280x960 -d /dev/video0 -f 10 -q 50" -o "./plugins/output_http/output_http.so -p 8080 -w ./www"
