var spawn = require('child_process').spawn,
    gps   = spawn('node', ['app/gps.js']);

gps.stdout.on('data', function (data) {
  console.log('GPS', data.toString('ascii'));
});

gps.stderr.on('data', function (data) {
  console.log('GPS: ERROR' + data);
});

gps.on('close', function (code) {
});


process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("Main shut down");
});
