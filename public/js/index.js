var jq = jQuery.noConflict();

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
	knob.setProperty('valMin', 0);
	knob.setProperty('valMax', 100);
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
var modal = document.getElementById('playlist-editor');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
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

var app = angular.module("myApp", []);

app.controller("mainController", ['$scope','$http','$sce', function($scope, $http, $sce) {
  $scope.thwomp = getTitle();
  $scope.view = 0;
  $scope.userInfo;
  $scope.playlistName = "Please Log in";
  $scope.playlistCreator = "username";
  $scope.playlistImg = "https://cdn3.iconfinder.com/data/icons/smileys-people-smiley-essential/48/v-51-512.png";
  $scope.playlistDescription = "Playlist description";
  $scope.playlistDuration = "0 hr 0 min";
  $scope.songs = [];
  $scope.temp= " ";
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
    for(var i = 0; i < 12; i++) {
      dial_settings[i] = knobs[i].getValue();
    }
    console.log(dial_settings);
  }
  // Get information about current user
  $scope.user = function(){
    $http.get("/userInfo/").then(function(data) {
      return data.data.user;
    }).then( function(result){
      $scope.userInfo = result;
    })
  }
  // need to call refreshPlaylist somewhere on the frontend automatically
  $scope.refreshPlaylist = function() {
    $http.get("/firstPlaylist").then(function(data) {
      // do something with the tracks
      console.log(data)
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
      $scope.temp = data.data.weather.main.temp;
      console.log(data.data.weather);
    })
  } 
}]);
