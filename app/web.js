var WebSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var app     = express();
var server  = http.createServer(app);

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

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

var clients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log('Connection from', request.origin, 'rejected!');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    clients.push(connection);
    console.log('Connection from', connection.remoteAddress, 'accepted (origin ' + request.origin + ').');

    connection.send(JSON.stringify({message: 'hello'}));

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received Message from', connection.remoteAddress, ':', message.utf8Data);

        var js = JSON.parse(message.utf8Data);
        connection.sendUTF(JSON.stringify({message: js.txt}));
      }
      else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
      }
    });
    connection.on('close', function(reasonCode, description) {
      console.log('Connection', connection.remoteAddress, 'disconnected.');
    });
});

process.on('message', function(m) {
  clients.forEach(function(c) {
    c.send(JSON.stringify(m));
  });
});

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("Web shut down");
});
