var express = require('express');
var router = express.Router();

var userManagement = require('./userManagement');
var common = require('./common');
var config = require('./config');
var redis = require('redis'),
    client = redis.createClient();

router.post('/changePassword', common.authInRequest, function(req, res){
  if(req.body.newPassword != null && req.body.newPassword.length > 4){
    userManagement.setPassword(req.user.idNumber, req.body.newPassword);
    res.send('0').end();
  }else{
    res.end();
  }
});

router.post('/login', common.authInRequest, function(req, res){
  req.session.idNumber = req.user.idNumber;
  console.log(req.user);
  req.session.save(function(err){
    res.send('0').end();
  });
});

router.post('/logout', common.loggedIn, function(req, res){
  req.session.idNumber = null;
  res.send('0').end();
});

router.post('/register', function(req, res){
  var name = req.body.name;
  var username = req.body.username;
  var idNumber = req.body.newId;
  var approverId = req.body.approverId;
  var passphrase = req.body.passphrase || '';
  if(passphrase != '' && common.passphraseIsValid(passphrase)){
    userManagement.createUser(idNumber, username, name, passphrase,
       passphrase == config.labMonitorPassphrase,
       passphrase == config.execPassphrase,
       passphrase == config.adminPassphrase,
       function(){
         res.send('0').end();
         return;
       }, function(error){
         if(error.message == "Username taken"){
           res.send('3').end();
         }else{
           res.send('1').end();
         }
       });
    return;
  }else if(passphrase != '' && !common.passphraseIsValid(passphrase)){
    res.send('4').end();
    return;
  }

  if(common.isValidId(idNumber) && common.isValidId(approverId) &&
    common.isValidUsername(username) && common.isValidName(name)){
      userManagement.getUser(approverId, function(approver){
        if(approver.labMonitor == 'true'){
          userManagement.createUser(idNumber, username, name, idNumber, false, false, false,
             function(){
              res.send('0').end();
            }, function(error){
              if(error.message == "Username taken"){
                res.send('3').end();
              }else{
                res.send('1').end();
              }
            });
        }
      }, function(){
        res.send('2').end();
      });
    }
});


module.exports = router;
