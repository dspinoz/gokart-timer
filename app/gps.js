var serialport = require('serialport');
var nmea = require('nmea');

var port = new serialport.SerialPort('/dev/ttyAMA0', {
                baudrate: 57600,
                parser: serialport.parsers.readline('\r\n')});

console.log('date,time,lat,lon,sat,hdop,alt,speed,track');

var cache = {};

port.on('data', function(line) {
    var gps = nmea.parse(line);
    
    if (gps.type == 'fix' && gps.fixType == 'fix')
    {
      var lat = gps.lat/100 * (gps.latPole == 'S' ? -1 : 1);
      var lon = gps.lon/100 * (gps.lonPole == 'W' ? -1 : 1);
      console.log(cache.date+','+gps.timestamp + ',' + lat + ',' + lon + ',' + gps.numSat + ',' + gps.horDilution + ',' + gps.alt + ',' + cache.speed + ',' + cache.track);
    }
    else if (gps.type == 'track-info') {
      cache.speed = gps.speedKmph;
      cache.track = gps.trackTrue;
    }
    else if (gps.type == 'nav-info') {
      cache.date = gps.date;
    }
});
