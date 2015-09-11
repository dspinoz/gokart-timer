
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

conn.onopen = function() {
  d3.select('#status').attr('class', 'fa fa-check').style('color', 'green').text(null);
};

conn.onerror = function(err) {
  d3.select('#status').attr('class', 'fa fa-exclamation-triangle').style('color', 'red').text(null);
  console.log('Connection error:', err);
  d3.select('#console').text('Connection error:', JSON.stringify(err));
};

var cache = [];

conn.onmessage = function(msg) {
  var data = JSON.parse(msg.data);

  if (data['gps_set']){
    d3.select('#status').attr('class', 'fa fa-spinner fa-pulse').text(null);

    data.gps_set.forEach(function(d) {
      cache.push(d);
    });
    while (cache.length > 100) {
      cache.shift();
    }

    if (cache.length == 0)
      d3.select('#cache').attr('class', 'fa fa-battery-empty').text(cache.length);
    if (cache.length > 24)
      d3.select('#cache').attr('class', 'fa fa-battery-1').text(cache.length);
    if (cache.length > 49)
      d3.select('#cache').attr('class', 'fa fa-battery-2').text(cache.length);;
    if (cache.length > 74)
      d3.select('#cache').attr('class', 'fa fa-battery-3').text(cache.length);
    if (cache.length >= 100)
      d3.select('#cache').attr('class', 'fa fa-battery-4').text(cache.length);

    var c = svg.selectAll('circle').data(cache);
    
    c.exit().remove();

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
    d3.select('#time').text(last.gps.time);
    d3.select('#speed').text(last.gps.speed);
    d3.select('#satellites').text(last.gps.satellites);
    d3.select('#track').text(last.gps.track);
  }
};

conn.onclose = function() {
  d3.select('#status').attr('class', 'fa fa-close').text(null);
};

