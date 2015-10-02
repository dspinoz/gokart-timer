
var w = 600, h = 600;
var svg = d3.select('#gps').append('svg').attr('width', w).attr('height', h);
           
var p = d3.geo.mercator()
  .scale(5000)
  .center([138, -34])
  .translate([w * 0.5, h * 0.5]);
  

var grat = d3.geo.graticule().minorStep([0.2,0.2]);
var grat_path = d3.geo.path().projection(p);
svg.append('path').attr('class', 'graticule').style({
    fill: 'none',
    stroke: '#777',
    'stroke-opacity': '0.05',
    'stroke-width': '0.5px'
  });

svg.select('path.graticule')
  .datum(grat)
  .attr('d', grat_path);

d3.select("#zoom").on("input", function() {
  d3.select('#zoomvalue').text(this.value);
  p.scale(+this.value);
  // repainting graticule is very heavy on CPU
  draw(null);
});

d3.select('#zoomvalue').text(d3.select("#zoom").attr('value'));
p.scale(d3.select("#zoom").attr('value'));
  
var conn = io.connect(window.location.href);
var ok = false;

conn.on('connect', function() {
  if (!ok) {
    d3.select('#status').selectAll('*').remove();
    d3.select('#status').append('span').attr('class', 'fa fa-check').style('color', 'green').text(null);
    ok = true;
  }
});

conn.on('error', function(err) {
  d3.select('#status').selectAll('*').remove();
  d3.select('#status').append('span').attr('class', 'fa fa-exclamation-triangle').style('color', 'red').text(JSON.stringify(err));
});

conn.on('disconnect', function() {
  d3.select('#status').selectAll('*').remove();
  d3.select('#status').append('span').attr('class', 'fa fa-close').style('color', 'red').text(null);
});
conn.on('reconnect', function(num) {
  d3.select('#status').selectAll('*').remove();
  d3.select('#status').append('span').attr('class', 'fa fa-check-square-o').style('color', 'green').text(null);
});
conn.on('reconnect_error', function(err) {
  d3.select('#status').selectAll('*').remove();
  var d = d3.select('#status').append('span');
  
  var st = d.append('span').attr('class', 'fa-stack').style('color', 'red').style('font-size', '0.5em');
  st.append('i').attr('class', 'fa fa-square-o fa-stack-2x');
  st.append('i').attr('class', 'fa fa-close fa-stack-1x');
  
  d.append('span').style('color', 'red').text(' ' +err);
});
conn.on('reconnect_failed', function(num) {
  d3.select('#status').selectAll('*').remove();
  
  var st = d3.select('#status').append('span').attr('class', 'fa-stack').style('color', 'red').style('font-size', '0.5em');
  st.append('i').attr('class', 'fa fa-square-o fa-stack-2x');
  st.append('i').attr('class', 'fa fa-close fa-stack-1x');
});

var last = {};
var cache = [];
var gps_history = [];
var history_inc = 100;
var history_count = history_inc;

var hp = {min: -1, max:-1}, vp = {min:-1, max:-1};
var distanceh = 0, distancev = 0;
    
var draw = function(data) {
  data = JSON.parse(data);
  
  if (data && data['gps_set']){
    //d3.select('#status').attr('class', 'fa fa-spinner fa-pulse').text(null);
    
    last = data.gps_set[data.gps_set.length-1];
    
    data.gps_set.forEach(function(d) {
      cache.push(d);
      
      history_count--;
      if (history_count <= 0) {
        gps_history.push({lat: d.gps.lat, lon: d.gps.lon});
        history_count = history_inc;
      }
      
    });
    
    while (gps_history.length > 500) {
      gps_history.shift();
    }
    
    while (cache.length > 100) {
      cache.shift();
    }

    d3.select('#history').text(gps_history.length);
    if (cache.length > 0 && cache.length < 24)
      d3.select('#cache').attr('class', 'fa fa-battery-empty').text(cache.length);
    if (cache.length > 24)
      d3.select('#cache').attr('class', 'fa fa-battery-1').text(cache.length);
    if (cache.length > 49)
      d3.select('#cache').attr('class', 'fa fa-battery-2').text(cache.length);;
    if (cache.length > 74)
      d3.select('#cache').attr('class', 'fa fa-battery-3').text(cache.length);
    if (cache.length >= 100)
      d3.select('#cache').attr('class', 'fa fa-battery-4').text(cache.length);

  }
  
  // re-center when point moves off the viewbox
  var pos = p([last.gps.lon, last.gps.lat]);
  if (pos[0] > w || pos[1] > h || pos[0] < 0 || pos[1] < 0) {
    p.center([last.gps.lon, last.gps.lat]);
  }

  var now = svg.selectAll('circle.now').data([last]);
  
  now.exit().remove();

  now.enter().append('circle').attr('class', 'now');

  now.attr('r', 2)
    .style('stroke', 'red')
    .style('fill', 'none')
    .attr('transform', function(d) {
      return 'translate('+p([d.gps.lon,d.gps.lat])+')';
    });
        
        
  var c = svg.selectAll('circle.cache').data(cache);
  c.exit().remove();
  c.enter().append('circle').attr('class', 'cache');
  c.attr('r', 1)
    .style('fill-opacity', 0.5)
    .style('fill', 'blue')
    .attr('transform', function(d) {
      return 'translate('+p([d.gps.lon,d.gps.lat])+')';
    });
    
    
  var h = svg.selectAll('circle.history').data(gps_history);
  h.exit().remove();
  h.enter().append('circle').attr('class', 'history');
  h.attr('r', 1)
    .style('fill-opacity', 0.2)
    .attr('transform', function(d) {
      return 'translate('+p([d.lon,d.lat])+')';
    })
    /*.on('mouseover', function() {
      console.log(d3.select(this));
    })*/;
    
  gps_history.forEach(function(d) {
    if (hp.min == -1 || hp.max==-1) {
      hp.min = d.lon;
      hp.max = d.lon;
    }
    
    if (d.lon < hp.min) {
      hp.min = d.lon;
    }
    else if (d.lon > hp.max) {
      hp.max = d.lon;
    }
    
    if (vp.min == -1 || vp.max == -1) {
      vp.min = d.lat;
      vp.max = d.lat;
    }
    if (d.lat < vp.min) {
      vp.min = d.lat;
    }
    else if (d.lat > vp.max) {
      vp.max = d.lat;
    }
    
  });
  d3.select('#distance').text((d3.geo.distance([hp.min, vp.min],[hp.max, vp.max])*6378100).toFixed(3) + 'm');

  d3.select('#time').text(last.gps.time);
  d3.select('#speed').text(last.gps.speed);
  d3.select('#satellites').text(last.gps.satellites);
  d3.select('#track').text(last.gps.track);
  d3.select('#hdop').text(last.gps.hdop);
};

conn.on('gps_set', draw);
