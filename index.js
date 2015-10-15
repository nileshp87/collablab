var express = require('express');
var config = require('./config');

var userManagement = require('./userManagement');
var users = require('./users');
var lab = require('./lab');
var manage = require('./manage');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var internal = express();
var external = express();

internal.use(express.static('public'));
external.use(express.static('public'));

internal.set('view engine', 'jade');
external.set('view engine', 'jade');

var bodyParser = require('body-parser');
internal.use(bodyParser.json());
external.use(bodyParser.json());

external.use(session({
  store: new RedisStore(),
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: false
}));

internal.get('/', function(req, res){
    res.render('internalIndex');
});

external.get('/', function(req, res){
    res.render('externalIndex');
});

internal.use('/lab', lab.internal);
external.use('/lab', lab.external);

internal.use('/users', users);
external.use('/users', users);

manage.setLab(lab.labActions);
external.use('/manage', manage.routes);

setup();
internal.set('domain','localhost');
internal.listen(8080);
external.listen(8181);

function setup(){
  if(config.nukeOnRestart){
    //userManagement.clear(setupDatabase());
  }else{
    setupDatabase();
  }
}

function setupDatabase() {
  userManagement.createUser(config.adminId, config.adminUsername, config.adminName,
    config.defaultLabMonitorPassword, true, true, true, function(user){
      console.log("Admin user not in system, creating...");
      userManagement.expirePassword(user.idNumber);
    });
}
