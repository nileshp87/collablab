var express = require('express');
var router = express.Router();

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

module.exports = router;
