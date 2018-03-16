'use strict';

// Global Variables
var clientID;
var clientSecret;
var google_map;


// Function Credit: maerics on StackOverflow
// Link: https://stackoverflow.com/a/8358141/9100856
function formatPhoneNumber(s) {
    var s2 = ("" + s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}

/* ================================================================
                          Map Styling
  =================================================================
  Map Styling and markMarkerIcon Function Credit:
  Udacity's, "Understanding API Services" Lessons
 ==================================================================*/

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

var map_styles = [{
    featureType: 'water',
    stylers: [{
        color: '#19a0d8'
    }]
}, {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [{
            color: '#ffffff'
        },
        {
            weight: 6
        }
    ]
}, {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{
        color: '#e85113'
    }]
}, {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{
            color: '#efe9e4'
        },
        {
            lightness: -40
        }
    ]
}, {
    featureType: 'transit.station',
    stylers: [{
            weight: 9
        },
        {
            hue: '#e85113'
        }
    ]
}, {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [{
        visibility: 'off'
    }]
}, {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{
        lightness: 100
    }]
}, {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{
        lightness: -100
    }]
}, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
            visibility: 'on'
        },
        {
            color: '#f0e4d3'
        }
    ]
}, {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{
            color: '#efe9e4'
        },
        {
            lightness: -25
        }
    ]
}];


/* ================================================================
                    Point of Interest's Data
   ================================================================ 
   To add more additional map locations, just append 
   the new place with it's name, lat, and long  
   ================================================================*/
var starter_locations = [{
        name: 'Its Greek to Me',
        lat: 32.144868,
        long: -80.75111
    },
    {
        name: 'Starbucks',
        lat: 32.153089,
        long: -80.767407
    },
    {
        name: 'Fat Babys Pizza',
        lat: 32.156831,
        long: -80.760423
    },
    {
        name: 'Java Burrito',
        lat: 32.1604,
        long: -80.753943
    },
    {
        name: 'The SmokeHouse',
        lat: 32.160518,
        long: -80.766002
    }
];

/* ================================================================
                            The Model
   ================================================================ 
   IMPORTANT NOTE: POI = Point of Interest 
   Used through the script for abbreviation 
   ================================================================*/
var point_of_interest = function (location_data) {
    var self = this;

    // Used to change color of marker 
    var default_icon_color = makeMarkerIcon('0091ff');
    var highlighted_icon_color = makeMarkerIcon('FFFF24');

    // Used in View to search and filter locations by name
    this.visible_bool = ko.observable(true);
    this.name = location_data.name;

    // For Google Maps API
    this.lat = location_data.lat;
    this.long = location_data.long;
    // Data From Foursquare
    // Needed for Marker's Info Window 
    this.foursquare_base_url = 'https://api.foursquare.com/v2/venues/search?ll=';
    // POI's Url 
    this.poi_url = "";
    this.street_address = "";
    this.city_state_zip = "";
    this.phone_number = "";
    // Concatenated the query parameter with POI's name 
    this.query_string = '&query=' + String(this.name);
    var foursquare_api_url = this.foursquare_base_url + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180315' + this.query_string;

    /* Returns the point_of_interest's (POI):
    url, street address, city, 
    state, zip code, and phone number
    Data is placed into the Google Marker's Info Window */
    $.getJSON(foursquare_api_url).done(function (data) {
        var foursquare_data = data.response.venues[0];
        self.poi_url = foursquare_data.url;
        // If missing data is returned from Foursquare API
        if (typeof self.poi_url === 'undefined') {
            self.poi_url = "";
        }
        // Gets POI's phone number
        self.phone_number = foursquare_data.contact.phone;
        // Formats the phone with formatPhoneNumber function defined in the beginning of the script
        if (typeof self.phone_number === 'undefined') {
            self.phone_number = "";
        } else {
            self.phone_number = formatPhoneNumber(self.phone_number);
        }
        // Gets the Street Address
        self.street_address = foursquare_data.location.formattedAddress[0];
        // Gets the POI's City, State, and Zip Code
        self.city_state_zip = foursquare_data.location.formattedAddress[1];

        // If the Foursquare API call fails
    }).fail(function () {
        alert("The Foursquare API call returned an error.");
    });

    // Adds new Google Marker
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(location_data.lat, location_data.long),
        title: location_data.name,
        map: google_map,
        icon: default_icon_color,
        animation: google.maps.Animation.DROP
    });


    // Declaring New InfoWindow Object
    // The content is added to InfoWindow when clicked
    this.info_window = new google.maps.InfoWindow();

    // If a marker is clicked
    this.marker.addListener('click', function () {
        self.info_window.setContent(
            '<div class="info-window-content">' +
            '<div class="title">' +
            '<b>' + location_data.name + '</b>' +
            '</div>' +
            '<div class="content">' +
            '<a href="' + self.poi_url + '">' + self.poi_url + '</a></div>' +
            '<div class="content">' + self.street_address + "</div>" +
            '<div class="content">' + self.city_state_zip + "</div>" +
            '<div class="content">' +
            '<a href="tel:' + self.phone_number + '">' + self.phone_number + '</a></div>' +
            '</div>')
    
        self.info_window.open(google_map, this);

        // Using Google's BOUNCE Animation 
        // Timeout in Milliseconds 
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 950);
    });

    // Credit: Udacity's, "Understanding API Services" Lessons
    this.marker.addListener('mouseover', function () {
        this.setIcon(highlighted_icon_color);
    });
    this.marker.addListener('mouseout', function () {
        this.setIcon(default_icon_color);
    });
    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };

};

/* =============================================================
                           The View
   ============================================================= */
function AppViewModel() {
    // Foursquare API Authentication
    clientID = "PCXFPLSE1HYBVSETPKXUUSLWLM53NTOB1O5LO53FEEJ453GQ";
    clientSecret = "XCN5QZ22K3O5S0KFA5OGBIXLVFUREI1VZYLNJ1X541NPMWBA";

    var self = this;

    // For the Side Bar search box
    this.searchTerm = ko.observable("");
    // POI = Point of Interest 
    this.poi_list = ko.observableArray([]);

    // Initiates Google Map with styles defined in the beginning of the script
    google_map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 32.1533973,
            lng: -80.7606692
        },
        zoom: 14.25,
        styles: map_styles
    });

    // Passes locations through the point_of_interest model
    starter_locations.forEach(function (poi_data) {
        self.poi_list.push(new point_of_interest(poi_data));
    });

    // Filtered search using Knockout
    this.sidebar_search_list = ko.computed(function () {
        // searchTerm() = the input from the Side Bar text box
        var user_input = self.searchTerm().toLowerCase();
        // For every key entered, the list is searched using Knockout's 
        // "valueUpdate: afterkeydown" and "arrayFilter" functions
        if (user_input) {
            return ko.utils.arrayFilter(self.poi_list(), function (poi_data) {
                var poi_lowercase = poi_data.name.toLowerCase();
                var search_result = (poi_lowercase.search(user_input) >= 0);
                // Only displays POI's that match the search_result's
                poi_data.visible_bool(search_result);
                return search_result;
            });
        // If no input from user, display all POI's
        } else {
            self.poi_list().forEach(function (poi_data) {
                poi_data.visible_bool(true);
            });
            return self.poi_list();
        }
    }, self);

    // Closes all InfoWindows when the map is clicked
    google.maps.event.addListener(google_map, 'click', function () {
        self.poi_list().forEach(function (poi_data) {
            poi_data.info_window.close();
        });
    });
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}