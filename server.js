// server init + mods
var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var path = require('path');
require('dotenv').config()


// initialize spotify api
var SpotifyWebApi = require('spotify-web-api-node2');

var spotifyApi = new SpotifyWebApi({
 clientId: process.env.CLIENT_ID,
 clientSecret: process.env.CLIENT_SECRET,
});

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile('/index.html');
});

app.use(express.static('public'));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

http.listen(3000, function(){
    console.log('Server up on *:3000');
  }, function() {
      console.log(process.env.CLIENT_ID);
    spotifyApi.clientCredentialsGrant().then(function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            spotifyApi.setAccessToken(data.body['access_token']);
        })
        .catch(function(err) {
            console.log(err)
        })
  })
