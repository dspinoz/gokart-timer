var conn = new WebSocket(document.URL.replace('http','ws'), "echo-protocol");

conn.onopen = function() {
  console.log('connected');
};

conn.onerror = function(err) {
  console.log('connection error', err);
};

conn.onmessage = function(msg) {
  console.log('message', msg);
};

conn.onclose = function() {
  console.log('disconnected');
};

