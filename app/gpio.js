var Gpio = require('onoff').Gpio;

var config = require('../config/gokart-timer');

var  led = new Gpio(config.gpio.led, 'out'),
     button = new Gpio(config.gpio.button, 'in', 'both');

console.log('GPIO starting...');
console.log('GPIO ok!');

function exit() {
  led.unexport();
  button.unexport();
  process.exit();
}

button.watch(function (err, value) {
  if (err) {
    console.error(err);
    return;
  }

  led.writeSync(value);
});

process.on('SIGINT', exit);
process.on('exit', function() {
  console.log('GPIO shut down');
});
