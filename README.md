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
* npm start
