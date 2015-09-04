var child_process = require('child_process');

var gps = child_process.fork(__dirname + '/app/gps.js');

gps.on('message', function(m) {
  console.log('GPS:', new Date(), m);
});

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("Main shut down");
});
