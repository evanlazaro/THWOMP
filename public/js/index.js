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
        h = this.h[Math.floor(Math.random() * json.w.length)];
        w = this.w[Math.floor(Math.random() * json.w.length)];
        thwomp = "The " +h+ " " +w+ " and Obscure Music Picker!";
      });
    }
  });
  return thwomp;
}
var app = angular.module("myApp", []);

app.controller("mainController", ['$scope','$http',function($scope, $http) {
  $scope.thwomp = getTitle();
	$scope.view = 0;
	$scope.songs = [['Song1','artist1','album1','3:58'], ['Song2','artist2','album2','6:56'], ['Song3','artist3','album3','3:48'], ['Song4','artist4','album4','3:58']];
  $scope.login = function(){
    $http.get("/authUrl/").then(function(data) {
      window.location = data.data.authUrl;
    })
  }
}]);
