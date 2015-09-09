var conn = new WebSocket(document.URL.replace('http','ws'), "echo-protocol");

d3.select('#console').append('div').text('woopa');
d3.select('#console').append('div').text('starting ' + JSON.stringify(conn));

conn.onopen = function() {
  console.log('connected');
  d3.select('#console').append('div').text('connected');
};

conn.onerror = function(err) {
  console.log('connection error', err);
  d3.select('#console').append('div').text('error: ' + err);
};

conn.onmessage = function(msg) {
  console.log('message', msg);
  d3.select('#console').append('div').text('message: ' + JSON.stringify(msg.data));
};

conn.onclose = function() {
  console.log('disconnected');
  d3.select('#console').append('div').text('disconnected');
};

