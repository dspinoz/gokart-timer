# gokart-timer
Timer for go-karting

This is an auto lap-timer for go karting, based on the raspberry pi!

## Hardware
* Raspberry Pi (model B)
* GPS Sensor LS20031
* LiPo battery 7.4v (750 mAh)

## Software Setup
* install minibian
* apt-get update
* apt-get upgrade
* apt-get install git

### Install Nodejs
* wget http://node-arm.herokuapp.com/node_latest_armhf.deb
* dpkg -i node_latest_armhf.deb
* node -v
* npm -v

### Install gokart-timer and dependencies
* git clone https://github.com/dspinoz/gokart-timer
* apt-get install build-essential screen
* npm install
* node_modules/bower/bin/bower install

### Running on Pi

Requires hardware setup correctly!

* npm start

### Testing on Workstation

Support Simulation mode in order to play back captured data

* node main.js sim --gps gps.out

### System Setup
* Auto load on startup

** crontab -e

  ```@reboot cd <installdir>; /usr/local/bin/node main.js 2>&1 | tee cron.log```

