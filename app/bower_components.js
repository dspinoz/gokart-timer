module.exports = function(app) {

  // TODO load minified in production environment

  app.get('/d3.js', function(req, res) {
    res.sendfile('bower_components/d3/d3.js');
  });
  
  app.get('/d3kit.js', function(req, res) {
	res.sendfile('bower_components/d3kit/dist/d3kit.js');
  });
};
