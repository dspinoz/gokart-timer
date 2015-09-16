var config = require('../config/gokart-timer');

console.log('GPIO-SIM starting...');
console.log('GPIO-SIM ok!');

process.on('SIGINT', function() {
  process.exit();
});

process.on('exit', function() {
  console.log('GPIO-SIM shut down');
});
