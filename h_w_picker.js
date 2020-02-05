$(document).ready(function() {
    var r = "./H_W_Rando.json";

    $.ajax({
        url: r,
        datatype: 'json',
        type: 'GET',

        success: function(data) {
            var h_count = Object.keys(data.h_word).length;
            var w_count = Object.keys(data.w_word).length;
            console.log(h_count);
            console.log(w_count);

            var x = Math.floor(Math.random() * (h_count + 1));
            var y = Math.floor(Math.random() * (w_count + 1));

            while (x == 0 || y == 0) {
                var x = Math.floor(Math.random() * h_count);
                var y = Math.floor(Math.random() * w_count);
            }

            console.log(x);
            console.log(y);

            console.log(data.h_word[x]);
            console.log(data.w_word[y]);

            var title_n = "The " + data.h_word[x] + " " + data.w_word[y] + " Obscure Music Picker";

            console.log(title_n);

            $("#title").html(title_n);  
        }
    })
});

                
