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


var app = angular.module("myApp", []);

app.controller("mainController", ['$scope','$http','$sce', function($scope, $http, $sce) {
  $scope.thwomp = getTitle();
  $scope.view = 0;
  $scope.userInfo;
  $scope.songs = [['i','artist1','album1','3:58',$sce.trustAsHtml('<iframe src="https://open.spotify.com/embed/track/3ODXRUPL44f04cCacwiCLC" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')],
                  ['Runaway','artist2','album2','6:56',$sce.trustAsHtml('<iframe src="https://open.spotify.com/embed/track/3DK6m7It6Pw857FcQftMds" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')],
                  ['Heartless','artist3','album3','3:48',$sce.trustAsHtml('<iframe src="https://open.spotify.com/embed/track/4EWCNWgDS8707fNSZ1oaA5" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')],
                  ['Scared of the Dark','artist4','album4','3:58',$sce.trustAsHtml('<iframe src="https://open.spotify.com/embed/track/3vWzyGTu6Ovo1GdrcJqH6e" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')]];
  $scope.login = function(){
    $http.get("/authUrl/").then(function(data) {
      window.location = data.data.authUrl;
    })
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
}]);
