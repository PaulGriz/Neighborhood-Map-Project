function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    $wikiElem.text("");
    $nytElem.text("");

    // Google's Street View Request for Background Image
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    $greeting.text('So, you want to live at ' + address + '?');

    var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + address + '';
    $body.append('<img class="bgimg" src="' + streetviewUrl + '">');



    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
        'api-key': "4f98a6e3a8184419b09d6ec30df11df7",
        'q': cityStr
    });
    $.ajax({
        url: url,
        method: 'GET',
    }).done(function (result) {
        articles = result.response.docs;
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' +
                '<a href="' + article.web_url + '">' + article.headline.main +
                '</a>' +
                '<p>' + article.snippet + '</p>' +
                '</li>');
        }
    }).fail(function (err) {
        throw err;
    });

}

sendData();

function sendData() {
    $('#form-container').submit(loadData);
}
