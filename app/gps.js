var serialport = require('serialport');
var nmea = require('nmea');

var port = new serialport.SerialPort('/dev/ttyAMA0', {
                baudrate: 57600,
                parser: serialport.parsers.readline('\r\n')});

var d = {},
    count = 0;

port.on('data', function(line) {
    var gps = null;
    try {
      gps = nmea.parse(line);
    }
    catch (err) {
      console.error(err);
      return;
    }

    //console.log('gps', gps);
    if (gps.type == 'fix')
    {
      var lat = gps.lat/100 * (gps.latPole == 'S' ? -1 : 1);
      var lon = gps.lon/100 * (gps.lonPole == 'W' ? -1 : 1);
      
      d.time = gps.timestamp;
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
      d.date = gps.date;
    }

    if (d['date'] && d['speed'] &&
        d['time']) {
      process.send(d);
      d = {};
    }
});
