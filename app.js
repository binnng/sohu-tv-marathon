var port = process.env.APP_PORT|| 80;

var express = require('express'),
	fs = require('fs'),
	http = require('http'),

	env = process.env.NODE_ENV || 'development';

var app = express();

app.use(express.favicon());

app.set('views', __dirname + '/view');
app.set('view engine', 'jade');

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.render('index');
});
app.get('/award', function(req, res) {
	res.render('award');
});



app.listen(port);

console.log('app is running at localhost:' + port);