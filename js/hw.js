$(document).ready(function() {
  $.ajaxSetup({beforeSend: function(xhr){
    if (xhr.overrideMimeType){
      xhr.overrideMimeType("application/json");
    }
  }});

  var json;
  var h;
  var w;
  $.getJSON("json/hw.json", function(result){
    $.each(result,function(){
      json = this;
      h = this.h[Math.floor(Math.random() * json.w.length)];
      w = this.w[Math.floor(Math.random() * json.w.length)];
      document.title = "The " +h+ " " +w+ " Obscure Music Picker!";
    });
  });
});
