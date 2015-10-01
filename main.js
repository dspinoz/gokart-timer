var child_process = require('child_process');
var fs = require('fs');
var bson = require("bson");
var cli = require('commander');

var config = require('./config/gokart-timer');
var BSON = new bson.BSONPure.BSON();
var cmd = {};

cli.version('0.0.1');

cli.command('sim')
  .description('simulation mode. Use to test GPS/GPIO modules with an input file')
  .option('--gps <file>', 'specify gps input filename', 'all.out')
  .option('--gps-delay <ms>', 'delay between gps points', 200)
  .action(function(opt) {
    cmd.sim = { gps: {file: opt.gps, delay: opt.gpsDelay} };
  });

cli.parse(process.argv);

console.log(config.title, 'starting...');

var web = child_process.fork(__dirname + '/app/web.js');
var gps,gpio;

if (cmd.sim) {
  gps = child_process.fork(__dirname + '/app/gps_sim.js', ['-f', cmd.sim.gps.file, '-d', cmd.sim.gps.delay]);
  gpio = child_process.fork(__dirname + '/app/gpio_sim.js');
}
else {
  gps = child_process.fork(__dirname + '/app/gps.js');
  gpio = child_process.fork(__dirname + '/app/gpio.js');
}

var children = [gps, web, gpio];

var cache = [];
var wcache = [];

function write_cache() {

  if (cmd.sim) {
    return true;
  }

  var i = 0;
  var fn = config.output.prefix + '-'+i+'.'+config.output.type;
  while(fs.existsSync(fn)) {
    i++;
    fn = config.output.prefix +'-'+i+'.'+config.output.type;
  }
  
  console.log("Writing GPS to", fn);
  
  if (config.output.type == 'bson') {
    fs.writeFile(fn, BSON.serialize(cache, false, true, false));
  }
  else if (config.output.type == 'json') {
    fs.writeFile(fn, JSON.stringify(cache));
  }
  else {
    console.log('ERROR', 'Invalid output type', config.output.type);
    process.kill(process.pid, 'SIGINT');
  }
}

gps.on('message', function(m) {
  //console.log('GPS:', new Date(), m);
  cache.push(m);
  wcache.push({gps: m});

  if (wcache.length > config.web.buffer){
    web.send({gps_set: wcache});
    wcache=[];
  }

  if (cache.length > config.gps.buffer) {
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
