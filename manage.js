var express = require('express');
var router = express.Router();
var common = require('./common');

router.get('/', function(req, res){
  res.render('manage');
});

router.get('home', common.loggedIn, function(req, res){
  if(req.user.admin == 'true'){
    res.render('admin');
  }else if(req.user.exec == 'true'){
    res.render('exec');
  }else if(req.user.labMonitor == 'true'){
    res.render('labMonitor');
  }else{
    res.send('Under Construction!');
  }
});

router.post('grant', common.loggedIn, function(req, res){
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


router.post('getPermission', common.loggedIn, function(req, res){

});

router.post('changeUsername', common.loggedIn, function(req, res){

});

router.post('updateNickname', common.loggedIn, function(req, res){

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

module.exports = router;
