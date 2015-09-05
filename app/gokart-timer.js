
var config = require('../config/gokart-timer');

var bower_resources = require('./bower_components');
var apiv1 = require('./apiv1');

module.exports = function(app) {

  bower_resources(app);
  apiv1(app);

  // configure templates
  app.locals.title = config.title;
  app.locals.pages = config.pages;

  app.get('/', function(req,res) {
	res.render('index', req);
  });

};
