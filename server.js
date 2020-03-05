// server init + mods
var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
var favicon = require('serve-favicon');
var path = require('path');
require('dotenv').config()


// initialize spotify api
var SpotifyWebApi = require('spotify-web-api-node2');

var spotifyApi = new SpotifyWebApi({
 clientId: process.env.CLIENT_ID,
 clientSecret: process.env.CLIENT_SECRET,
 redirectUri: 'http://localhost:3000/callback'
});
// need to change scopes later depending on what data we need from the user
var scopes = ['user-read-private', 'user-read-email'];
// need to redirect user to the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
console.log(authorizeURL);


app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile('/index.html');
});
app.get('/authUrl/', function(req, res){
    res.json({authUrl: authorizeURL});
})
// once the user has authorized, it will send a get request to the redirect uri with the auth code
app.get('/callback', function(req, res){
    // get and set authorization code for this user
    spotifyApi.authorizationCodeGrant(req.query.code).then(
        function(data) {
          console.log('The token expires in ' + data.body['expires_in']);
          console.log('The access token is ' + data.body['access_token']);
          console.log('The refresh token is ' + data.body['refresh_token']);
          // Set the access token on the API object to use it in later calls
          spotifyApi.setAccessToken(data.body['access_token']);
          spotifyApi.setRefreshToken(data.body['refresh_token']);
        },
        function(err) {
          console.log('Something went wrong!', err);
        }
      ).then(function() {
        res.redirect('/');
      });
    
})

// Returns JSON data about user
app.get('/userInfo/', function(req, res){
    spotifyApi.getMe().then(function(data) {
      return data.body
    }, function(err) {
      return null;
    }).then( function(result){
      res.json( { user: result } );
    });
})

// Logout
app.get('/logout/', function(req, res){
  spotifyApi.resetAccessToken();
  spotifyApi.resetRefreshToken();
  res.redirect('/');
})

app.get('/firstPlaylist', function(req, res) {
  spotifyApi.getUserPlaylists().then(
    function(data) {
      console.log("playlist id: ", data.body.items[0].id);
      var playlistId = data.body.items[0].id;
      spotifyApi.getPlaylistTracks(playlistId).then(function(data) {
        res.json({songs: data.body.items});
      })
    },
    function(err) {
      console.log(err);
    }
  )
})

app.use(express.static('public'));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

http.listen(3000, function(){
    console.log('Server up on *:3000');
  });
