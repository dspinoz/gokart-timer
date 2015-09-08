var serialport = require('serialport');
var nmea = require('nmea');
var d3 = require('d3');

var timeFormat = d3.time.format('%y%m%d%H%M%S.%L');

var port = new serialport.SerialPort('/dev/ttyAMA0', {
                baudrate: 57600,
                parser: serialport.parsers.readline('\r\n')});

var started = false,
    d = {},
    count = 0;

console.log('GPS starting...');

port.on('data', function(line) {
    var gps = null;
    try {
      gps = nmea.parse(line);
    }
    catch (err) {
      console.error(err);
      return;
    }

    if (!started) {
      console.log('GPS ok!');
      started = true;
    }

    //console.log('gps', gps);
    if (gps.type == 'fix')
    {
      var lat = gps.lat/100 * (gps.latPole == 'S' ? -1 : 1);
      var lon = gps.lon/100 * (gps.lonPole == 'W' ? -1 : 1);
      
      d.gps_time = gps.timestamp;
      d.lat = lat;
      d.lon = lon;
      d.satellites = gps.numSat;
      d.hdop = gps.horDilution;
      d.altitude = gps.alt; 
    }
    else if (gps.type == 'track-info') {
      d.speed = gps.speedKmph;
      d.track = gps.trackTrue;
    }
    else if (gps.type == 'nav-info') {
      d.gps_date = gps.date;
    }

    if (d['gps_date'] && d['speed'] &&
        d['gps_time']) {
      d.time = timeFormat.parse(d.gps_date + d.gps_time);
      process.send(d);
      d = {};
    }
});

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("GPS shut down");
});
