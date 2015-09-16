var express = require('express');
var redis = require('redis'),
    client = redis.createClient();

var config = require('./config');

var labStatus = {
  open: false,
  members: [],
};

client.on('error', function(err) {
  console.log("Redis Error: " + err);
});


var app = express();
app.use(express.static('public'));
app.set('view engine', 'jade');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.render('index', { title: 'Swiper', message: 'OPEN'});
});

app.post('/swipe', function(req, res) {
  console.log(req.body);
  if(req.body.idNumber != null){
    processSwipe(req.body.idNumber, res);
  }else{
    res.send("4");
  }
});

app.get('/status', function(req, res) {
  res.send(JSON.stringify(labStatus));
});

//app.use('/swipe', swipe);

client.on('ready', function() {
  setupRedis();
  app.listen(8080);
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
    var index = isPresent(user);
    if(index == -1){
      labStatus.members.push(user);
      labStatus.open = true;
      res.send("0");
    }else{
      labStatus.members.splice(index, 1);
      if(!isLabMonitorInLab() && user.labMonitor && labStatus.members.length > 0){
        res.send("3");
        labStatus.members.push(user);
      }else if (!isLabMonitorInLab() && labStatus.members.length == 0) {
        labStatus.open = false;
        res.send("0");
      }
    }

  });
}

function isPresent(user){
  for(i in labStatus.members){
    if(labStatus.members[i].idNumber == user.idNumber){
      return i;
    }
  }
  return -1;
}

function isLabMonitorInLab(){
  for(i in labStatus.members){
    if(labStatus.members[i].labMonitor){
      return true;
    }
  }
  return false;
}
