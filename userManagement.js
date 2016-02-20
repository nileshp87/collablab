var userManagement = {};
var redis = require('redis'),
    client = redis.createClient();
var config = require('./config');
var crypto = require('crypto');

failedLogins = {};

userManagement.setPassword = function(idNumber, password, needsPassword){
  needsPassword = needsPassword || false;
  var salt = crypto.randomBytes(8).toString('hex');
  var hashSum = hash(password, salt);
  client.hset(idNumber, 'password', hashSum);
  client.hset(idNumber, 'salt', salt);
  client.hset(idNumber, 'needsPassword', needsPassword);
  return true;
};

userManagement.getUser = function(idNumber, success, failure){
  failure = failure || function(){};
  client.hgetall(idNumber, function(error, user){
    if(user != null){
      if(user.labMonitor == 'true'){
        if(user.labHours){
          user.labHours = JSON.parse(user.labHours);
          console.log(user.labHours);
          userManagement.getLabHours(user.labHours, function(labHours){
            user.labHours = labHours;
            success(user);
          });
          return;
        }
        user.labHours = [];
      }
      success(user);
    }else{
      failure(new Error('User does not exist'));
    }
  });
};

userManagement.getLabHours = function(labHourList, callback){
  labHours = [];
  labHourList.forEach(function(hour, index, arr){
    client.lindex('labHours', hour, function(error, data){
      if(data){
        var data = JSON.parse(data);
        data.id = hour;
        labHours.push(data);
      }
      if(index == arr.length - 1){
        callback(labHours);
      }
    });
  });
};

userManagement.getUserByUsername = function(username, success, failure){
  success = success || function(){};
  failure = failure || function(){};

  client.hget('users', username.toLowerCase(), function(error, idNumber){
    if(idNumber == null){
      failure(new Error('User does not exist'));
      return;
    }
    userManagement.getUser(idNumber, success, failure);
  });
}

userManagement.doesUserExist = function(idNumber, exists, notExists){
  notExists = notExists || function(){};
  exists = exists || function(){};
  client.hexists(idNumber,'name', function(error, reply){
    if(reply != 0){
      exists();
      return;
    }
    notExists();
  });
};

userManagement.createUser = function(idNumber, username, name, password, labMonitor, exec, admin, success, failure){
  success = success || function(){};
  failure = failure || function(){};
  userManagement.doesUserExist(idNumber, function(){
    failure(new Error('User exists'));
  }, function(){
    userManagement.isUsernameAvailable(username.toLowerCase(), function(){
      client.hmset(idNumber, "name", name,
                             "labMonitor", labMonitor,
                             "exec", exec,
                             "admin", admin,
                             "needsPassword", labMonitor || exec || admin,
                             "displayName", username,
                             "nickname", "",
                             "username", username.toLocaleLowerCase(),
                             "idNumber", idNumber);
      client.hset("users", username.toLowerCase(), idNumber);
      userManagement.setPassword(idNumber, password, false);
      success({"idNumber": idNumber,
              "username": username.toLowerCase(),
              "displayName": username,
              "name": name,
              "labMonitor": labMonitor,
              "exec": exec,
              "admin": admin,
              "needsPassword": false,
              "idNumber": idNumber
            });
      }, function(){
        failure(new Error('Username taken'));
      });
  });
};

userManagement.correctCreds = function(idNumber, password, success, failure){
  client.hgetall(idNumber, function(error, user){
    if(user == null){
      return false;
    }
    if(user.password == hash(password, user.salt)){
      delete failedLogins[idNumber];
      success(user);
    }else{
      if(failedLogins[idNumber] != undefined){
        failedLogins[idNumber]['fails']++;
      }else{
        failedLogins[idNumber] = {};
        failedLogins[idNumber]['fails'] = 0;
        failedLogins[idNumber]['time'] = new Date().getTime();
      }

      var time = new Date().getTime() - failedLogins[idNumber]['time'] < config.lockoutLength * 1000;
      var fails = failedLogins[idNumber]['fails'] > config.failsBeforeLockout;

      if(fails && !time){
        failedLogins[idNumber]['fails'] = 1;
        failedLogins[idNumber]['time'] = new Date().getTime();
      }
      failure();
    }
  });
};

userManagement.log = function(idNumber, action){
  client.incr("logNum", function(errors, logNum){
    client.hmset('log:' + logNum, 'idNumber', idNumber, 'action', action);
  });
};

userManagement.isLocked = function(idNumber){
  var time = new Date().getTime() - failedLogins[idNumber]['time'] < config.lockoutLength * 1000;
  var fails = failedLogins[idNumber]['fails'] > config.failsBeforeLockout;
  return time && fails;
};

userManagement.isUsernameAvailable = function(username, yes, no){
  yes = yes || function(){};
  no = no || function(){};
  client.hexists('users', username.toLowerCase(), function(error, reply){
    if(reply == 0){
      yes();
    }else{
      no();
    }
  });
};

userManagement.expirePassword = function(idNumber){
  client.hset('idNumber', 'needsPassword', true);
  return true;
};

userManagement.delete = function(idNumber, success){
  success = success || function(){};
  client.hget(idNumber, 'username', function(error, username){
    client.hdel('users', username);
    client.hdel(idNumber, 'idNumber', 'name', 'username', 'displayName',
      'labMonitor', 'exec', 'admin', 'password', 'salt', 'nickname');
      success();
  });
};

userManagement.clear = function(after){
  client.flushall(after);
};

userManagement.grantByIdNumber = function(grant, user, success, failure){
  success = success || function() {};
  failure = failure || function() {};
  userManagement.doesUserExist(user, function(){
    client.hset(user, grant, 'true');
    success();
    }, failure
  );
};

userManagement.grantByUsername = function(grant, username, success, failure){
  success = success || function() {};
  failure = failure || function() {};
  userManagement.getUserByUsername(username, function(user){
    userManagement.grantByIdNumber(grant, user.idNumber, success, failure);
      }, failure
  );
};

userManagement.changeNickname = function(idNumber, newNickname){
  client.hset(idNumber, 'nickname', newNickname);
};

userManagement.changeUsername = function(idNumber, newUsername, oldUsername){
  client.hset(idNumber, 'username', newUsername.toLowerCase());
  client.hset(idNumber, 'displayName', newUsername);
  client.hdel('users', oldUsername);
  client.hset('users', newUsername.toLowerCase(), idNumber);
};

userManagement.changeName = function(idNumber, newName){
  client.hset(idNumber, 'name', newName);
};

userManagement.resetPassword = function(idNumber, success, failure){
  success = success || function() {};
  failure = failure || function() {};
  userManagement.doesUserExist(idNumber,
    function(){
      userManagement.setPassword(idNumber, idNumber, false);
      success();
    }, failure);
}

userManagement.addLabHours = function(userID, dayOfWeek, startTime, endTime, success, failure){
  success = success || function() {};
  failure = failure || function() {};
  client.rpush('labHours', JSON.stringify(
                {'labMonitor': userID,
                 'dayOfWeek': dayOfWeek,
                 'startTime': startTime,
                 'endTime': endTime}),
                 function(error, data){
                   if(data){
                     client.rpush('labHours' + dayOfWeek, data-1);
                     client.hgetall(userID, function(error, user){
                       if(!user){
                         failure();
                         return;
                       }
                        if(!user.labHours){
                          user.labHours = [];
                        }else{
                          user.labHours = JSON.parse(user.labHours);
                        }
                        user.labHours.push(data-1);
                        client.hset(userID, 'labHours', JSON.stringify(user.labHours), function(error, data){
                          if(data){
                            success();
                          }else{
                            failure();
                          }
                        });
                     });
                   } else {
                     failure();
                     return;
                   }
                 });
};
function hash(password, salt){
  shasum = crypto.createHash('sha256');
  shasum.update(salt);
  shasum.update(password);
  return shasum.digest('hex');
}

module.exports = userManagement;
