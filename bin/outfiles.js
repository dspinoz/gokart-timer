#!/usr/bin/env node

var fs = require('fs');
var cli = require('commander');
var xmldoc = require('xmldoc');

var cmd = { };

cli.version('0.0.1');

cli.command('concat')
  .description('concat all files into one')
  .option('-o, --output <file>', 'specify output filename', 'all.out')
  .option('-p, --path <path>', 'change the input path', process.cwd())
  .option('-f, --format <regex>', 'change the file name format. must specify at least one regex group for sorting purposes', function(arg) {
    console.log('format', arg);
    var regex = new RegExp(arg + '|'); //alternation
    console.log('exec', regex, regex.exec('').length);
    if ((regex.exec('').length - 1) > 0) {
      return arg;
    }
    return false;
  }, "^gps-([0-9]*).out$")
  .action(function(opt) {
    cmd.concat = { output: opt.output, path: opt.path, format: opt.format};
  });

cli.command('convert')
  .description('convert files from another format')
  .option('-o, --output <file>', 'specify output filename', 'convert.out')
  .option('--gpx <file>', 'specify input filename in GPX (GPS Exchange Format)', 'data.gpx')
  .action(function(opt) {
    cmd.convert = { output: opt.output, gpx: opt.gpx };
  });
  
cli.parse(process.argv);

if (cmd.concat) {

  if (!cmd.concat.format) {
    console.error("Invalid format regex");
    process.exit(1);
  }
  
  var matcher = new RegExp(cmd.concat.format);

  var files = fs.readdirSync(cmd.concat.path)
    .filter(function(f) {
      return matcher.test(f);
    })
    .sort(function(a,b) {
      var resA = matcher.exec(a);
      var resB = matcher.exec(b);
      return resA[1] - resB[1];
    });
    
  console.log('Got', files.length, 'files that match');

  if (files.length > 0) {
    console.log('Running concat');
    var out = [];
    files.forEach(function(f) {
      var b = fs.readFileSync(cmd.concat.path + '/' + f);

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
}
else if (cmd.convert) {

  var data = [];

  if (cmd.convert.gpx) {
    var gpx = new xmldoc.XmlDocument(fs.readFileSync(cmd.convert.gpx));
    gpx.childrenNamed('trk').forEach(function(trk) {
      trk.childrenNamed('trkseg').forEach(function(trkseg) {
        trkseg.childrenNamed('trkpt').forEach(function(trkpt) {
          var d = {lat: +trkpt.attr.lat, 
                   lon: +trkpt.attr.lon, 
                   time: trkpt.childNamed('time').val};
          
          data.push(d);
        });
      });
    });
  }
  else {
    console.err('Unknown conversion format specified');
    process.exit(1);
  }
  
  console.log('Found', data.length, 'data points from input');
  if (data.length > 0) {
  
    var json = JSON.stringify(data, true, ' ');
    console.log('Writing', json.length, 'bytes to file', cmd.convert.output);
    fs.writeFileSync(cmd.convert.output, json);
    console.log('done!');
  }
  
}