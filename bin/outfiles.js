#!/usr/bin/env node

var fs = require('fs');
var cli = require('commander');

var cmd = { };

cli.version('0.0.1')
  .option('-p, --path <path>', 'change the input path', process.cwd())
  .option('-f, --format <regex>', 'change the file name format. must specify at least one regex group for sorting purposes', function(arg) {
    console.log('format', arg);
    var regex = new RegExp(arg + '|'); //alternation
    console.log('exec', regex, regex.exec('').length);
    if ((regex.exec('').length - 1) > 0) {
      return arg;
    }
    return false;
  }, "^gps-([0-9]*).out$");

cli.command('concat')
  .description('concat all files into one')
  .option('-o, --output <file>', 'specify output filename', 'all.out')
  .action(function(opt) {
    cmd.concat = { output: opt.output};
  });

cli.parse(process.argv);


if (!cli.format) {
  console.error("Invalid format regex");
  process.exit(1);
}


var matcher = new RegExp(cli.format);

var files = fs.readdirSync(cli.path)
  .filter(function(f) {
    return matcher.test(f);
  })
  .sort(function(a,b) {
    var resA = matcher.exec(a);
    var resB = matcher.exec(b);
    return resA[1] - resB[1];
  });
  
console.log('Got', files.length, 'files that match');

if (cmd.concat && files.length > 0) {
  console.log('Running concat');
  var out = [];
  files.forEach(function(f) {
    var b = fs.readFileSync(cli.path + '/' + f);

    if (b && b.length) {

      var json = JSON.parse(b.toString());
      json.forEach(function(pt) {
        out.push(pt);
      });
    }
  });
  
  var json = JSON.stringify(out, true, ' ');
  console.log('Writing', json.length, 'bytes to file', cmd.concat.output);
  fs.writeFileSync(cmd.concat.output, json);
  console.log('done!');
}
