var child_process = require('child_process');
var fs = require('fs');
var bson = require("bson");

var config = require('./config/gokart-timer');

var BSON = new bson.BSONPure.BSON();

console.log(config.title, 'starting...');

var gps = child_process.fork(__dirname + '/app/gps.js');
var web = child_process.fork(__dirname + '/app/web.js');

var data = [];

gps.on('message', function(m) {
//  console.log('GPS:', new Date(), m);
  data.push(m);

  if (data.length > 1000) {
    var i = 0;
    var fn = 'gps-'+i+'.out';
    while(fs.existsSync(fn)) {
      i++;
      fn = 'gps-'+i+'.out';
    }
    fs.writeFile(fn, JSON.stringify(data));
//    fs.writeFile(fn, BSON.serialize(data, false, true, false));
    data = [];
  }
});

gps.on('error', function(err) {
  console.log('GPS ERROR', err);
});


web.on('message', function(m) {
});

web.on('error', function(err) {
  console.log('WEB ERROR', err);
});


process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log(config.title, "shut down");
});
