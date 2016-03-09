var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/404', function(req, res) {
    res.send('404');
});

app.get('/node_modules/angular/angular.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/angular/angular.js');
});

app.get('/node_modules/angular-route/angular-route.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/angular-route/angular-route.js');
});

app.get('/', sendIndex);
app.get('/login', sendIndex);

function sendIndex(req, res) {
    res.sendFile(__dirname + '/public/index.html');
}

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
