var child_process = require('child_process');
var fs = require('fs');
var bson = require("bson");

var config = require('./config/gokart-timer');

var BSON = new bson.BSONPure.BSON();

console.log(config.title, 'starting...');

var gps = child_process.fork(__dirname + '/app/gps.js');
var web = child_process.fork(__dirname + '/app/web.js');
var gpio = child_process.fork(__dirname + '/app/gpio.js');

var children = [gps, web, gpio];

var cache = [];
var wcache = [];

function write_cache() {
  var i = 0;
  var fn = 'gps-'+i+'.out';
  while(fs.existsSync(fn)) {
    i++;
    fn = 'gps-'+i+'.out';
  }
  console.log("Writing GPS to", fn);
  fs.writeFile(fn, JSON.stringify(cache));
//  fs.writeFile(fn, BSON.serialize(cache, false, true, false));
}

gps.on('message', function(m) {
//  console.log('GPS:', new Date(), m);
  cache.push(m);
  wcache.push({gps: m});

  if (wcache.length > 5){
    web.send({gps_set: wcache});
    wcache=[];
  }

  if (cache.length > 1000) {
    write_cache();
    cache = [];
  }
});

gps.on('error', function(err) {
  console.log('GPS ERROR', err);
});
gps.on('exit', function() {
  children.pop();
});


web.on('message', function(m) {
});

web.on('error', function(err) {
  console.log('WEB ERROR', err);
});
web.on('exit', function() {
  children.pop();
});


gpio.on('message', function(m) {
});
gpio.on('error', function(err) {
  console.log('GPIO ERROR', err);
});
gpio.on('exit', function() {
  children.pop();
});


process.on('SIGINT', function() {
  write_cache();
  children.forEach(function(p) {
    p.kill('SIGINT');
  });
  var i = setInterval(function() {
    if (children.length == 0) {
      clearInterval(i);
      process.exit(0);
    }
  }, 100);
});

process.on('exit', function(code) {
  console.log(config.title, "shut down");
});
