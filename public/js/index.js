var jq = jQuery.noConflict();

function getKnobValues(){
  var knob_values = [];
  for(var i = 0; i < 12; i++) {
    knob_values[i] = knobs[i].getValue();
  }
  return knob_values;
}

function getTitle(scope){
  var json;
  var h;
  var w;
  var thwomp = {};
  jq.ajax({
    url: "json/hw.json",
    async: false,
    dataType: 'json',
    success: function(result) {
      jq.each(result,function(){
        json = this;
        h = this.h[Math.floor(Math.random() * json.h.length)];
        w = this.w[Math.floor(Math.random() * json.w.length)];
        thwomp = "The " +h.charAt(0).toUpperCase() + h.slice(1) + " " +w.charAt(0).toUpperCase() + w.slice(1) + " and Obscure Music Picker!";
      });
    }
  });
  return thwomp;
}

var dial_settings = []
var knobs = [];
for(var i = 0; i < 12; i++){
	var pureknob = new PureKnob();
	var knob = pureknob.createKnob(120, 120);
	// Set properties.
	knob.setProperty('angleStart', -0.75 * Math.PI);
	knob.setProperty('angleEnd', 0.75 * Math.PI);
	knob.setProperty('colorFG', '#88ff88');
  knob.setProperty('trackWidth', 0.4);
  if(i == 0) {
    knob.setProperty('valMin', 0);
    knob.setProperty('valMax', 24);
  } else if(i==6){
    knob.setProperty('valMin', -60);
    knob.setProperty('valMax', 0);
  } else if(i==2){
    knob.setProperty('valMin', 0);
    knob.setProperty('valMax', 220);
  }else {
    knob.setProperty('valMin', 0);
    knob.setProperty('valMax', 100);
  }
	// Set initial value.
  knob.setValue(50);
  knobs.push(knob);

	// Create element node.
	var node = knob.node();

	// Add it to the DOM.
	var elem1 = document.getElementById('dial'+(i+1));
  elem1.appendChild(node);
  dial_settings.push(50);
}
function msToHMS( ms ) {
  // 1- Convert to seconds:
  var seconds = ms / 1000;
  // 2- Extract hours:
  var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  if(hours)
    return ( hours+" hr "+minutes+" min ");
  else
    return ( minutes+":"+parseInt(seconds) );
}
var clock = document.getElementById('clock');
var clock2 = document.getElementById('clock2');

function time() {
  var d = new Date();
  var s = d.getSeconds();
  var m = d.getMinutes();
  var h = d.getHours()%12;
  if(s < 10) {
    s = "0"+s;
  }
  if(m < 10) {
    m = "0"+m;
  }
  clock.textContent = h + ":" + m + ":" + s;
  clock2.textContent = h + ":" + m + ":" + s;
}

setInterval(time, 1000);

var app = angular.module("myApp", []);

app.controller("mainController", ['$scope','$http','$sce', function($scope, $http, $sce) {
  $scope.thwomp = getTitle();
  $scope.view = 0;
  $scope.weather_view = 0;
  $scope.userInfo;
  $scope.playlistName = "Please Log in";
  $scope.playlistCreator = "username";
  $scope.playlistImg = "https://cdn3.iconfinder.com/data/icons/smileys-people-smiley-essential/48/v-51-512.png";
  $scope.playlistDescription = "Playlist description";
  $scope.playlistDuration = "0 hr 0 min";
  $scope.songs = [];
  $scope.weather = ['',''];
  $scope.login = function(){
    $http.get("/authUrl/").then(function(data) {
      window.location = data.data.authUrl;
    })
    $scope.refreshPlaylist();
  }
  // Log out
  $scope.logout = function(){
    $http.get("/logout/");
    $scope.user();
  }
  $scope.playlist = function(){
    var knob_values = getKnobValues();
    console.log(knob_values);
  }
  // Get information about current user
  $scope.user = function(){
    $http.get("/userInfo/").then(function(data) {
      return data.data.user;
    }).then( function(result){
      $scope.userInfo = result;
      console.log(result);
    })
  }
  // need to call refreshPlaylist somewhere on the frontend automatically
  $scope.refreshPlaylist = function() {
    $http.get("/firstPlaylist").then(function(data) {
      // do something with the tracks
      console.log(data)
      $scope.weather_view = 0;
      $scope.playlistName = data.data.songs.body.name;
      $scope.playlistCreator = data.data.songs.body.owner.display_name;
      $scope.playlistImg = data.data.songs.body.images[1].url;
      $scope.playlistDescription = data.data.songs.body.description;
      var dur = 0;
      for(var i = 0; i < 20; i++) {
        var song = [];
        song.push( data.data.songs.body.tracks.items[i].track.name);//title
        song.push( data.data.songs.body.tracks.items[i].track.artists[0].name);//artist
        song.push( data.data.songs.body.tracks.items[i].track.album.name); //album
        dur+=data.data.songs.body.tracks.items[i].track.duration_ms;
        song.push( msToHMS(data.data.songs.body.tracks.items[i].track.duration_ms)); //time(ms)
        song.push( $sce.trustAsHtml('<iframe src="https://open.spotify.com/embed/track/'+data.data.songs.body.tracks.items[i].track.id+'" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'));//to get the uri
        $scope.songs.push(song);
      }
      $scope.playlistDuration = msToHMS(dur);
    })
  }
  $scope.getWeather = function() {
    $http.get("/weather").then(function(data) {
      $scope.weather = [];
      $scope.weather.push(data.data.weather.main.temp);
      $scope.weather.push("http://openweathermap.org/img/wn/"+data.data.weather.weather[0].icon+".png");
      $scope.weather.push("http://openweathermap.org/img/wn/"+data.data.weather.weather[0].icon+"@2x.png");
      console.log(data.data.weather);
    })
  }
  $scope.setKnob = function(i, val) {
    knobs[i].setValue(val);
    dial_settings[i] = val;
  }
  $scope.setKnobs = function() {
    $scope.setKnob(0,14);
    $scope.setKnob(2, 120);
    $scope.setKnob(4, 5);
    $scope.setKnob(5, 15);
    $scope.setKnob(6, -5);
    $scope.setKnob(7, 76);
    $scope.setKnob(8, 5);
    $scope.setKnob(9, 60);
    $scope.setKnob(10, 70);
    $scope.setKnob(11, 10);
  }
  $scope.getUserPresetName = function (){
    document.getElementById('playlist-editor').style.display='none';
  }
  $scope.saveUserPreset = async function(){
    var name = jq('#userPresetNameInput').val();
    jq('#userPresetNameModal').modal('hide');
    jq('#playlist-editor').modal('show');
    var knobs = getKnobValues();
    var data = {
      id: $scope.userInfo.id,
      name: name,
      key: knobs[0],
      key_confidence: knobs[1],
      tempo: knobs[2],
      tempo_confidence: knobs[3],
      instrumentalness: knobs[4],
      liveness: knobs[5],
      loudness: knobs[6],
      energy: knobs[7],
      speechiness: knobs[8],
      valence: knobs[9],
      danceability: knobs[10],
      acousticness: knobs[11]
    };
    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    };

    var response = await fetch('/newUserPreset', options);
    var responseData = await response.json();
  }
}]);
