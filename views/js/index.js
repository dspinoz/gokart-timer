
var w = 600, h = 400;
var svg = d3.select('#gps').append('svg').attr('width', w).attr('height', h);

var c = {"lat":-34.490547,"lon":138.378078999};
            
var p = d3.geo.mercator()
  //.scale((w + 1) / 2 / Math.PI)
  .scale(100000)
  .translate([w / 2, h / 2])
  .precision(.1)
  .center([c.lon, c.lat]);

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
  var data = JSON.parse(msg.data);

  if (data['gps_set']){
    d3.select('#console').append('div').text('message: ' + JSON.stringify(data));

    var c = svg.selectAll('circle').data(data.gps_set);
    
    c.enter().append('circle');

    c.attr('transform', function(d) {
      return 'translate('+p([d.gps.lon,d.gps.lat])+')';
    })
    c.attr('r', 0)
    c.style('fill', 'red')
    c.style('fill-opacity', 0.2)
    .transition()
      .duration(function(d,i) {
        return i * 100;
      })
      .attr('r', 5);

    
    var last = data.gps_set[data.gps_set.length-1];
    console.log('last', last);
    d3.select('#time').text(last.gps.time);
    d3.select('#speed').text(last.gps.speed);
    d3.select('#satellites').text(last.gps.satellites);
    d3.select('#track').text(last.gps.track);



  }

};

conn.onclose = function() {
  console.log('disconnected');
  d3.select('#console').append('div').text('disconnected');
};

