var express = require('express');
var redis = require('redis'),
    client = redis.createClient();

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var config = require('./config');
var crypto = require('crypto');

var failedLogins = {};
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
internal.use(cookieParser(config.internalSecret));
external.use(cookieParser(config.externalSecret));
internal.use(cookieSession({secret: config.internalSecret, name: 'collab'}));
external.use(cookieSession({secret: config.externalSecret, name: 'collab'}));
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

internal.post('/closeLab', function(req, res){
  if(req.body.idNumber != null && isValidId(req.body.idNumber) && req.body.password != null){
    correctCreds(req.body.idNumber, req.body.password, function(){
      console.log("success");
      res.send('0').end();
      labStatus.open = false;
      labStatus.members = {};
      names = [];
      delete failedLogins[req.body.idNumber];
    }, function(){
      console.log("login failed");
      if(failedLogins[req.body.idNumber] != undefined){
        failedLogins[req.body.idNumber]['fails']++;
      }else{
        failedLogins[req.body.idNumber] = {};
        failedLogins[req.body.idNumber]['fails'] = 0;
        failedLogins[req.body.idNumber]['time'] = new Date().getTime();
      }

      var time = new Date().getTime() - failedLogins[req.body.idNumber]['time'] < config.lockoutLength * 1000;
      var fails = failedLogins[req.body.idNumber]['fails'] > config.failsBeforeLockout;
      if(time && fails){
        res.send('2').end();
        return;
      }
      if(fails && !time){
        failedLogins[req.body.idNumber]['fails'] = 1;
        failedLogins[req.body.idNumber]['time'] = new Date().getTime();
      }
      res.send('1').end();
      return;
    });
  }else{
    res.end();
  }
});

internal.post('/changePassword', changePassword);
external.post('/changePassword', changePassword);

internal.get('/status', function(req, res) {
  res.send(JSON.stringify({"open":labStatus.open, "members":names})).end();
});

client.on('ready', function() {
  setupRedis();
  internal.set('domain','localhost');
  internal.listen(8080);
  external.listen(8181);
});

internal.get('/manage', getManage);
external.get('/manage', getManage);
external.post('/login', postLogin);

function getManage(req, res){
  res.render('manage');
}

function postLogin(req, res){

}

function correctCreds(idNumber, password, success, failure){
  client.hgetall(idNumber, function(error, replies){
    if(replies == null){
      return false;
    }
    console.log(hash(password, replies.salt));
    console.log(replies.password);

    if(replies.password == hash(password, replies.salt)){
      success();
    }else{
      failure();
    }
  });
}

function hash(password, salt){
  shasum = crypto.createHash('sha256');
  shasum.update(salt);
  shasum.update(password);
  return shasum.digest('hex');
}

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
  setPassword(idNumber, config.defaultLabMonitorPassword);
  client.hset(idNumber, "needsPassword", labMonitor || exec || admin);
  return {"idNumber":idNumber,
          "name": name,
          "labMonitor": labMonitor,
          "exec": exec,
          "admin": admin,
          "needsPassword": labMonitor || exec || admin
        };
}

function processSwipe(idNumber, res){
  client.hgetall(idNumber, function(error, replies){
    var user = replies;
    if(replies == null){
      res.send("2").end();
      return;
    }

    if( !labStatus.open && user.labMonitor == 'false'){
      res.send("1").end();
      return;
    }

    if(labStatus.members[idNumber] == undefined){
      labStatus.members[idNumber] = user;
      if(user.needsPassword == 'true'){
        res.send("4").end();
        console.log(user);
      }else{
        res.send("0").end();
      }
      labStatus.open = true;
      names.push(user.name);
      return;
    }
    console.log(user);
    delete labStatus.members[idNumber];
    console.log(user);
    names.splice(names.indexOf(user.name),1);
    if(!isLabMonitorInLab() && user.labMonitor == 'true' && names.length > 0){
      res.send("3").end();
      labStatus.members[idNumber] = user;
      names.push(user.name);
      return;
    }else if (!isLabMonitorInLab()) {
      console.log(user.labMonitor);
      console.log(labStatus.members.length);
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
    if(labStatus.members[i].labMonitor == 'true'){
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

function changePassword(req, res){
  oldPassword = req.body.password;
  newPassword = req.body.newPassword;
  idNumber = req.body.idNumber;
  console.log(oldPassword);
  if(oldPassword == null || newPassword == null || idNumber == null){
    res.close();
    return;
  }
  if(isValidId(idNumber)){
    correctCreds(idNumber, oldPassword, function(){
      setPassword(idNumber, newPassword);
      res.send('0').end();
      return;
    }, function(){
      console.log(idNumber);
      res.send('1').end();
      return;
    });
  }else{
    res.send('1').end();
  }
}

function setPassword(idNumber, password){
  salt = crypto.randomBytes(8).asciiSlice();
  hashSum = hash(password, salt);
  client.hset(idNumber, 'password', hashSum);
  client.hset(idNumber, 'salt', salt);
  client.hset(idNumber, 'needsPassword', 'false');
  return true;
}
