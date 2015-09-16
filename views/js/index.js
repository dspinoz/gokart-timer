
var w = 600, h = 600;
var svg = d3.select('#gps').append('svg').attr('width', w).attr('height', h);
           
var p = d3.geo.mercator()
  .scale(9000000)
  .center([138, -34])
  .translate([w * 0.5, h * 0.5]);

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
var gps_history = [];
var history_inc = 1;
var history_count = history_inc;

conn.onmessage = function(msg) {
  var data = JSON.parse(msg.data);

  if (data['gps_set']){
    d3.select('#status').attr('class', 'fa fa-spinner fa-pulse').text(null);
    
    var last = data.gps_set[data.gps_set.length-1];
    
    // re-center when point moves off the viewbox
    var pos = p([last.gps.lon, last.gps.lat]);
    if (pos[0] > w || pos[1] > h || pos[0] < 0 || pos[1] < 0) {
      p.center([last.gps.lon, last.gps.lat]);
    }
    

    data.gps_set.forEach(function(d) {
      cache.push(d);
      
      history_count--;
      if (history_count <= 0) {
        gps_history.push({lat: d.gps.lat, lon: d.gps.lon});
        history_count = history_inc;
        d3.select('#minmax').text(gps_history.length);
      }
      
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

    var now = svg.selectAll('circle.now').data([last]);
    
    now.exit().remove();

    now.enter().append('circle').attr('class', 'now');

    now.attr('r', 2)
      .style('stroke', 'red')
      .style('fill', 'none')
      .attr('transform', function(d) {
        return 'translate('+p([d.gps.lon,d.gps.lat])+')';
      });
        
        
    var c = svg.selectAll('circle.history').data(gps_history);
    c.exit().remove();
    c.enter().append('circle').attr('class', 'history');
    
    c.attr('r', 1)
      .style('fill-opacity', 0.3)
      .attr('transform', function(d) {
        return 'translate('+p([d.lon,d.lat])+')';
      });

    d3.select('#time').text(last.gps.time);
    d3.select('#speed').text(last.gps.speed);
    d3.select('#satellites').text(last.gps.satellites);
    d3.select('#track').text(last.gps.track);
  }
};

conn.onclose = function() {
  d3.select('#status').attr('class', 'fa fa-close').text(null);
};

