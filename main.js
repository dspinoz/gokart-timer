var child_process = require('child_process');
var fs = require('fs');
var bson = require("bson");

var BSON = new bson.BSONPure.BSON();

var gps = child_process.fork(__dirname + '/app/gps.js');

var data = [];

gps.on('message', function(m) {
  console.log('GPS:', new Date(), m);
  data.push(m);

  if (data.length > 100) {
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

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("Main shut down");
});
