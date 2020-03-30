// server init + mods
var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
var weather = require('openweather-apis');
weather.setLang('en');
var request = require('request');
require('dotenv').config();


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
});
// once the user has authorized, it will send a get request to the redirect uri with the auth code
app.get('/callback', function(req, res){
    // get and set authorization code for this user
    spotifyApi.authorizationCodeGrant(req.query.code).then(
        function(data) {
          console.log('The token expires in ' + data.body.expires_in);
          console.log('The access token is ' + data.body.access_token);
          console.log('The refresh token is ' + data.body.refresh_token);
          // Set the access token on the API object to use it in later calls
          spotifyApi.setAccessToken(data.body.access_token);
          spotifyApi.setRefreshToken(data.body.refresh_token);
        },
        function(err) {
          console.log('Something went wrong!', err);
        }
      ).then(function() {
        res.redirect('/');
      });

});

// Returns JSON data about user
app.get('/userInfo/', function(req, res){
    spotifyApi.getMe().then(function(data) {
      return data.body;
    }, function(err) {
      return null;
    }).then( function(result){
      res.json( { user: result } );
    });
});

// Logout
app.get('/logout/', function(req, res){
  spotifyApi.resetAccessToken();
  spotifyApi.resetRefreshToken();
  res.redirect('/');
});

app.get('/firstPlaylist', function(req, res) {
  spotifyApi.getUserPlaylists().then(
    function(data) {
      console.log("playlists: ", data.body.items);
      var temp = {...data.body.items, size: data.body.items.length};
      var playlistId = data.body.items[req.query.index].id;
      spotifyApi.getPlaylist(playlistId).then(function(data) {
        console.log(data);
        var output = {...data,...temp}
        res.json({songs: output});
      })
    },
    function(err) {
      console.log(err);
    }
  )
})

app.get('/weather' , function(req, res) {
  url = ('https://geolocation-db.com/json');
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      if(!error && response.statusCode === 200) {
          weather.setAPPID(process.env.OPEN_KEY);
          weather.setCity(body.city);
          weather.setCoordinate(body.latitude, body.longitude);
          weather.setZipCode(body.postal);
          weather.setUnits('imperial');
          weather.getAllWeather(function(err, JSONObj){
            console.log(JSONObj);
            res.json({weather: JSONObj})
          });
      }
  })
})

app.use(express.static('public'));

http.listen(3000, function(){
    console.log('Server up on *:3000');
  });
