var express = require('express');
var redis = require('redis'),
    client = redis.createClient();

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

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
internal.use(cookieParser('45kybfg89l4y89lb5kymg8rl'));
external.use(cookieParser('aopr8bsr28ga786noytchons'));
internal.use(cookieSession({secret: '45kybfg89l4y89lb5kymg8rl', name: 'collab'}));
external.use(cookieSession({secret: 'aopr8bsr28ga786noytchons', name: 'collab'}));
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

internal.post('/register', function(req, res){
  newId = req.body.newId;
  approverId = req.body.approval;
  name = req.body.name;
  if(newId == null || approverId == null || name == null || !isValidId(newId) || !isValidId(approverId) || name.length == 0 || !onlyAlphabets(name)){
    res.end();
    return;
  }
  registerUser(name, newId, approverId, res);
  return;
});

internal.post('/swipe', function(req, res) {
  if(req.body.idNumber != null && isValidId(req.body.idNumber)){
    processSwipe(req.body.idNumber, res);
  }else{
    res.end();
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

internal.get('/manage', function(req, res){

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
      res.send("2").end();
      return;
    }

    if( !labStatus.open && !user.labMonitor){
      res.send("1").end();
      return;
    }

    if(labStatus.members[idNumber] == undefined){
      labStatus.members[idNumber] = user;
      labStatus.open = true;
      res.send("0").end();
      names.push(user.name);
      return;
    }
    delete labStatus.members[idNumber];
    names.splice(names.indexOf(user.name),1);
    if(!isLabMonitorInLab() && user.labMonitor && labStatus.members.length > 0){
      res.send("3".end());
      labStatus.members[idNumber] = user;
      return;
    }else if (!isLabMonitorInLab()) {
      labStatus.open = false;
      res.send("0").end();
    }else{
      res.send("0").end();
    }
  });
}

function registerUser(name, newUserId, approverId, res){
  client.hgetall(approverId, function(error, replies){
    var approver = replies;
    if(replies == null || !approver.labMonitor){
      res.send('2').end();
      return;
    }
    client.hexists(newUserId,'name', function(error, reply){
      console.log("hit: " + reply);
      if(reply != 0){
        res.send('1').end();
        return;
      }
      createUser(newUserId, name, false, false, false);
      res.send('0').end();
      return;
    });
  })
}

function isLabMonitorInLab(){
  for(i in labStatus.members){
    if(labStatus.members[i].labMonitor){
      return true;
    }
  }
  return false;
}

function isValidId(idNumber){
  return idNumber.trim().length == 9 && !isNaN(idNumber);
}

function onlyAlphabets(str) {
   var regex = /^[a-zA-Z\s]*$/;
   if (regex.test(str)) {
       return true;
   } else {
       return false;
   }
}
