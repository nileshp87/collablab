var express = require('express');

var app = express();
app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function(req, res){
    res.render('index', { title: 'Index', message: 'out'});
});

//app.use('/swipe', swipe);


app.listen(8080);
