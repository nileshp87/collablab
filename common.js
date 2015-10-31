var config = require('./config');

var userManagement = require('./userManagement');

common = {};

common.isValidId = function(idNumber){
  return idNumber != null && idNumber.trim().length == 9 && !isNaN(idNumber);
};

common.isValidUsername = function(username){
  return username != null && config.usernameRegex.test(username) && username.length < 31;
};

common.isValidName = function(str) {
   return config.nameRegex.test(str) && str.length < 31;
};

common.authInRequest = function(req, res, next){
  if (req.body.password == null){
    res.end();
  }
  if(common.isValidId(req.body.idNumber)){
    userManagement.correctCreds(req.body.idNumber, req.body.password, function(user){
      req.user = user;
      next();
    }, function(){
      res.send('1').end();
    });
  }else if(common.isValidUsername(req.body.idNumber)){
    userManagement.getUserByUsername(req.body.idNumber,
      function(lookup){
        userManagement.correctCreds(lookup.idNumber, req.body.password ,  function(user){
          req.user = user;
          next();
        }, function(){
          res.send('1').end();
        });
      }, function(){
        res.send('1').end();
      });
  }else{
    res.end();
  }
};

common.idNumberInRequest = function(req, res, next){
  if(common.isValidId(req.body.idNumber)){
    userManagement.getUser(req.body.idNumber, function(user){
      req.user = user;
      next();
    }, function(){
      res.send('2').end();
    });
  }else if(common.isValidUsername(req.body.idNumber)){
    userManagement.getUserByUsername(req.body.idNumber, function(user){
      req.user = user;
      next();
    }, function(){
      res.send('2').end();
    });
  }else{
    res.end();
  }
}

common.loggedIn = function(req, res, next){
  if(req.session.idNumber != null){
    userManagement.getUser(req.session.idNumber, function(user){
      req.user = user;
      next();
    }, function(){
      res.redirect('/manage');
    })
  }else{
    res.redirect('/manage');
    return;
  }
};

common.isValidNickname = function(nickname){
    var regex = /^[\d\w ]{4,30}$/;
    return nickname != null && regex.test(nickname);
};

common.passphraseIsValid = function (passphrase){
  return passphrase != null && (
    passphrase == config.labMonitorPassphrase ||
    passphrase == config.execPassphrase ||
    passphrase == config.adminPassphrase);
};

common.getGrantFromPassphrase = function(passphrase){
  switch(passphrase){
    case config.labMonitorPassphrase: return 'labMonitor';
    case config.execPassphrase: return 'exec';
    case config.adminPassphrase: return 'admin';
    default: return false;
  }
};

common.isValidGrant = function(grant){
  return grant != null && (
    grant == 'labMonitor' ||
    grant == 'exec' ||
    grant == 'admin');
};

common.canGrant = function(user, grant){
  if(user.admin == 'true'){
    return true;
  }else if(user.exec == 'true'){
    return grant == 'labMonitor';
  }
};

common.resetDatabase = function(){
  userManagement.clear(function(){
    userManagement.createUser(config.adminId, config.adminUsername, config.adminName,
      config.defaultAdminPassword, true, true, true, function(user){
        userManagement.expirePassword(user.idNumber);
      });
  });
};

module.exports = common;
