var fs = require('fs');
var cli = require('commander');

cli.version('0.0.1')
  .option('-f, --input <path>', 'input file with saved gps data')
  .option('-d, --delay <ms>', 'sleep time between gps points', 200) //5 Hz
  .parse(process.argv);

if (!cli.input) {
  console.error('no input file provided');
  process.exit(1);
}

if (!fs.existsSync(cli.input)) {
  console.error('could not find input file', cli.input);
  process.exit(1);
}

console.log('GPS-SIM starting...');
console.log('GPS-SIM ok!');


var b = fs.readFileSync(cli.input);

function write(gps) {
  if (!gps) {
    return false;
  }
  if (process.send) {
    process.send(gps);
  }
  else {
    console.log(gps);
  }
  return true;
}

if (b && b.length) {

  console.log('GPS-SIM read', b.length, 'bytes');

  var json = JSON.parse(b.toString());
  
  // ensure the first one is written straight away, without delay
  write(json.shift());
  
  var sender = setInterval(function() {
  
    if (!write(json.shift())) {
      clearInterval(sender);
    }
    
  }, cli.delay);
}
else {
  console.error('no data read from file', cli.input);
  process.exit(1);
}

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("GPS-SIM shut down");
});
