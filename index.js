var express = require('express');
var redis = require('redis'),
    client = redis.createClient();

var config = require('./config');

var labStatus = {
  open: false,
  members: {}
};

var names = [];

client.on('error', function(err) {
  console.log("Redis Error: " + err);
});


var internal = express();
var external = express();

internal.use(express.static('public'));
external.use(express.static('public'));
internal.set('view engine', 'jade');
external.set('view engine', 'jade');
var bodyParser = require('body-parser');
internal.use(bodyParser.json());

internal.get('/', function(req, res){
    res.render('internalIndex', { title: 'Swiper', message: labStatus.open ? 'OPEN' : 'CLOSED'});
});

external.get('/', function(req, res){
    res.render('externalIndex', { title: 'Status', message: labStatus.open ? 'OPEN' : 'CLOSED' });
});

external.get('/status', function(req, res){
  res.send(JSON.stringify({"open":labStatus.open, "members":names}));
});

internal.post('/swipe', function(req, res) {
  console.log(req.body);
  if(req.body.idNumber != null){
    processSwipe(req.body.idNumber, res);
  }else{
    res.send("4");
  }
});

internal.get('/status', function(req, res) {
  res.send(JSON.stringify({"open":labStatus.open, "members":names}));
});

client.on('ready', function() {
  setupRedis();
  internal.set('domain','localhost');
  internal.listen(8080);
  external.listen(8181);
});

function setupRedis() {
  client.hget(config.adminId, function(err, reply){
    if(reply == null){
      data = {};
      createUser(config.adminId, config.adminName, true, true, true);
    }
  });
}

function createUser(idNumber, name, labMonitor, exec, admin){
  client.hset(idNumber, "name", name);
  client.hset(idNumber, "labMonitor", labMonitor);
  client.hset(idNumber, "exec", exec);
  client.hset(idNumber, "admin", admin);
  return {"idNumber":idNumber,
          "name": name,
          "labMonitor": labMonitor,
          "exec": exec,
          "admin": admin
        };
}

function processSwipe(idNumber, res){
  client.hgetall(idNumber, function(error, replies){
    var user = replies;
    if(replies == null){
      res.send("2");
      return;
    }
    if( !labStatus.open && !user.labMonitor){
      res.send("1");
      return;
    }
    if(labStatus.members[idNumber] == undefined){
      labStatus.members[idNumber] = user;
      labStatus.open = true;
      res.send("0");
      names.push(user.name);
      return;
    }
    delete labStatus.members[idNumber];
    names.splice(names.indexOf(user.name),1);
    if(!isLabMonitorInLab() && user.labMonitor && labStatus.members.length > 0){
      res.send("3");
      labStatus.members[idNumber] = user;
      return;
    }else if (!isLabMonitorInLab()) {
      labStatus.open = false;
      res.send("0");
    }else{
      res.send("0");
    }
  });
}

function isLabMonitorInLab(){
  for(i in labStatus.members){
    if(labStatus.members[i].labMonitor){
      return true;
    }
  }
  return false;
}
