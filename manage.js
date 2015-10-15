var express = require('express');
var router = express.Router();
var common = require('./common');
var userManagement = require('./userManagement');
var lab = {};

router.get('/', function(req, res){
  if(req.session.idNumber != null){
    res.redirect('/manage/home');
    return;
  }
  res.render('manage');
});

router.get('/home', common.loggedIn, function(req, res){
  res.render('home', {'user' : req.user, 'title' : 'Management'});
  console.log(req.user);
});

router.post('/grant', common.loggedIn, function(req, res){
  if(validGrant(req.body.type) && (common.isValidId(req.body.user) || common.isValidUsername(req.body.user))){
    var grant = req.body.type;
    if(canGrant(grant, req.user)){
      if(common.isValidId(req.body.user)){
        userManagement.grantByIdNumber(grant, req.body.user, function(){
          res.send('0').end();
        }, function(){
          res.send('1').end();
        });
      }if(common.isValidUsername(req.body.user)){
        userManagement.grantByUsername(grant, req.body.user, function(){
          res.send('0').end();
        }, function(){
          res.send('1').end();
        });
      }
    }
  }else{
    res.send('2').end();
  }
});


router.post('/getPermission', common.loggedIn, function(req, res){
  if(common.passphraseIsValid(req.body.passphrase)){
    userManagement.grantByIdNumber(common.getGrantFromPassphrase(req.body.passphrase),
    req.user.idNumber, function(){
      res.send('0').end();
    }, function(){
      res.send('1').end();
    });
  }else{
    res.send('1').end();
  }
});

router.post('/changeUsername', common.loggedIn, function(req, res){
  if(common.isValidUsername(req.body.username)){
    userManagement.getUserByUsername(req.body.username,
      function(){
        res.send('1').end();
      }, function(){
        userManagement.changeUsername(req.user.idNumber, req.body.username, req.user.username);
        lab.updateList();
        res.send('0').end();
      });
  }else{
    res.send('1').end();
  }
});

router.post('/changeNickname', common.loggedIn, function(req, res){
  if(common.isValidNickname(req.body.nickname)){
    userManagement.changeNickname(req.user.idNumber, req.body.nickname);
    lab.updateList();
    res.send('0').end();
  }else{
    res.send('1').end();
  }
});

router.post('/changeName', common.loggedIn, function(req, res){
  if(common.isValidName(req.body.name)){
    userManagement.changeName(req.user.idNumber, req.body.name);
    lab.updateList();
    res.send('0').end();
  }else{
    res.send('1').end();
  }
});

router.post('/changePassword', common.loggedIn, function(req, res){
  if(req.body.password == null || req.body.newPassword == null){
    res.end();
    return;
  }
  userManagement.correctCreds(req.user.idNumber, req.body.password,
    function(){
      userManagement.setPassword(req.user.idNumber, req.body.newPassword);
      res.send('0').end();
    }, function(){
      res.send('1').end();
    });
});

router.post('/deleteAccount', common.loggedIn, function(req, res){
  if(req.body.password == null){
    res.end();
    return;
  }
  userManagement.correctCreds(req.user.idNumber, req.body.password,
    function(){
      userManagement.delete(req.user.idNumber, function(){
        req.session.idNumber = null;
        res.send('0').end();
      });
    }, function(){
      res.send('1').end();
    });
});

function validGrant(grant){
  return grant != null &&
         (grant == 'labMonitor' ||
         grant == 'admin' ||
         grant == 'exec');
}

function canGrant(grant, user){
  if(grant == 'labMonitor'){
    return user.exec == 'true' || user.admin == 'true';
  }if(grant == 'admin'){
    return user.admin == 'true';
  }
  return false;
}

function setLab(toSet){
  console.log(toSet);
  lab = toSet;
}

module.exports = {'routes': router, 'setLab': setLab};
