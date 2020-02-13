// server init + mods
var app = require('express')();
var http = require('http').Server(app);
var mongoose = require('mongoose');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// start server
http.listen(3000, function(){
    console.log('Server up on *:3000');
});