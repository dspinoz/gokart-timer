var http = require('http');
var express = require('express');
var socketio = require('socket.io');

var app     = express();
var server  = http.createServer(app);
var io      = socketio(server);

var config = require('../config/gokart-timer');
var routes = require('./gokart-timer');

app.configure(function() {
  
  app.use(express.logger('dev')); // log every request to the console

  app.use("/css",  express.static(__dirname + '/../views/css'));
  app.use("/js", express.static(__dirname + '/../views/js'));

  //pretty print templated resources
  app.locals.pretty = true;
  
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/../views');
});

routes(app);

console.log("Web starting...");
exports = module.exports = app;

server.listen(config.port, function() { // startup our app at http://localhost:port
  console.log("Web ok! Listening on " + config.port + "...");
});

io.on('connection', function(client) {
	console.log('Client connected via websocket: ', client.conn.id);
});

process.on('message', function(m) {
  io.emit('gps_set', JSON.stringify(m));
});

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("Web shut down");
});
