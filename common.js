var config = require('./config');

var userManagement = require('./userManagement');

common = {};

common.isValidId = function(idNumber){
  return idNumber != null && idNumber.trim().length == 9 && !isNaN(idNumber);
};

common.isValidUsername = function(username){
  return username != null && config.usernameRegex.test(username);
};

common.isValidName = function(str) {
   return config.nameRegex.test(str);
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
  if(req.session.user != null){
    req.user = req.session.user;
    next();
  }else{
    res.redirect('/manage');
    return;
  }
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
}

module.exports = common;
