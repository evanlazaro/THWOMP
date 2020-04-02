// server init + mods
var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fs = require('fs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
var weather = require('openweather-apis');
weather.setLang('en');
var request = require('request');
require('dotenv').config();


// connect to db
mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    })
  .then(() => console.log('\nDB Connected!'))
  .catch(err => {
    console.log('\nDB Connection Error: ${err.message}');
  });

// make user_preset model
var Schema = mongoose.Schema;
var user_presetsSchema = new Schema({
  user_id: String,
  name: String,
  key: Number,
  key_confidence: Number,
  tempo: Number,
  tempo_confidence: Number,
  instrumentalness: Number,
  liveness: Number,
  loudness: Number,
  energy: Number,
  speechiness: Number,
  valence: Number,
  danceability: Number,
  acousticness: Number,
});
var User_preset = mongoose.model('user_presets', user_presetsSchema);

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

// Return songs from users playlist given playlist number
app.get('/playlists', function(req, res) {
  spotifyApi.getUserPlaylists().then(
    function(data) {
      console.log("playlists: ", data.body.items);
      var temp = {...data.body.items, size: data.body.items.length};
      var playlistId = data.body.items[req.query.index].id;
      // Return songs
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

// Retrieve weather data from API
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

// Retrieve presets for current user
app.get('/user_presets', function(req, res){
  mongoose.model('user_presets').find(function(err, user_presets){
    res.send(user_presets);
  })
})

// Add new user preset to database
app.post('/newUserPreset', function(req, res){
  var preset = new User_preset();
  preset.user_id = req.body.id;
  preset.name = req.body.name;
  preset.key = req.body.key;
  preset.key_confidence = req.body.key_confidence;
  preset.tempo = req.body.tempo;
  preset.tempo_confidence = req.body.tempo_confidence;
  preset.instrumentalness = req.body.instrumentalness;
  preset.liveness = req.body.liveness;
  preset.loudness = req.body.loudness;
  preset.energy = req.body.energy;
  preset.speechiness = req.body.speechiness;
  preset.valence = req.body.valence;
  preset.danceability = req.body.danceability;
  preset.acousticness = req.body.acousticness;
  preset.save(function(err, savedObject){
    if (err){
      console.log(err);
      res.status(500).send();
    }else{
      console.log('\nNew user Preset saved for ' + req.body.id);
      res.send(savedObject);
    }
  });
});

app.use(express.static('public'));

http.listen(3000, function(){
    console.log('\nServer up on *:3000');
  });
