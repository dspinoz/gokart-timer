module.exports = function(app) {

  // TODO load minified in production environment

  app.get('/d3.js', function(req, res) {
    res.sendfile('bower_components/d3/d3.js');
  });
  
  app.get('/d3kit.js', function(req, res) {
	res.sendfile('bower_components/d3kit/dist/d3kit.js');
  });

  //fontawesome
  app.get('/font-awesome.css', function(req,res) {
    res.sendfile('bower_components/font-awesome/css/font-awesome.css');
  });

  app.get('/fonts/fontawesome-webfont.woff', function(req,res) {
    res.sendfile('bower_components/font-awesome/fonts/fontawesome-webfont.woff');
  });

  app.get('/fonts/fontawesome-webfont.woff2', function(req,res) {
    res.sendfile('bower_components/font-awesome/fonts/fontawesome-webfont.woff2');
  });

  app.get('/fonts/fontawesome-webfont.ttf', function(req,res) {
    res.sendfile('bower_components/font-awesome/fonts/fontawesome-webfont.ttf');
  });
  
  app.get('/fonts/fontawesome-webfont.eot', function(req,res) {
    res.sendfile('bower_components/font-awesome/fonts/fontawesome-webfont.eot');
  });
  
  app.get('/fonts/fontawesome-webfont.svg', function(req,res) {
    res.sendfile('bower_components/font-awesome/fonts/fontawesome-webfont.svg');
  });

};
