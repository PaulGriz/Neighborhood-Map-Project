'use strict';

// Globals
var clientID;
var clientSecret;
var googleMap;


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
  Credit for Marker Function and Map Styling:
  Udacity's, "Understanding API Services" Lessons
 ==================================================================*/

/**
 * Takes in a Hex Color Code
 * Returns a formatted Google Map Marker Icon
 * @param {any} markerColor 
 * @returns Google Map Marker Icon
 */
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

var mapCustomStyle = [{
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
var starterLocations = [{
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
/**
 * Accepts a Point of Interest's Name, Lat, and Long
 * Calls Foursquare API for  POI's Website Url, Phone, and Address
 * Generates a Google Map Marker with data from Input and Foursquare
 * @param {any} locationData 
 */
var pointOfInterest = function (locationData) {
    var self = this;

    // Used to change color of marker 
    var defaultIconColor = makeMarkerIcon('0091ff');
    var highlightedIconColor = makeMarkerIcon('FFFF24');

    // Used in View to search and filter locations by name
    this.visible_bool = ko.observable(true);
    this.name = locationData.name;

    // For Google Maps API
    this.lat = locationData.lat;
    this.long = locationData.long;
    // Data From Foursquare
    // Needed for Marker's Info Window 
    this.foursquareBaseUrl = 'https://api.foursquare.com/v2/venues/search?ll=';
    // POI's Url 
    this.poiWebsite = "";
    this.poiStreetAddress = "";
    this.poiCityStateZipCode = "";
    this.poiPhoneNumber = "";
    // Concatenated the query parameter with POI's name 
    this.queryString = '&query=' + String(this.name);
    var foursquareApiUrl = (this.foursquareBaseUrl + this.lat + ',' +
        this.long + '&client_id=' + clientID + '&client_secret=' +
        clientSecret + '&v=20180315' + this.queryString);

    /* Returns the pointOfInterest's (POI):
    url, street address, city, 
    state, zip code, and phone number
    Data is placed into the Google Marker's Info Window */
    $.getJSON(foursquareApiUrl).done(function (data) {
        var foursquareData = data.response.venues[0];
        self.poiWebsite = foursquareData.url;
        // If missing data is returned from Foursquare API
        if (typeof self.poiWebsite === 'undefined') {
            self.poiWebsite = "";
        }
        // Gets POI's phone number
        self.poiPhoneNumber = foursquareData.contact.phone;
        // Formats the phone with formatPhoneNumber function defined in the beginning of the script
        if (typeof self.poiPhoneNumber === 'undefined') {
            self.poiPhoneNumber = "";
        } else {
            self.poiPhoneNumber = formatPhoneNumber(self.poiPhoneNumber);
        }
        // Gets the Street Address
        self.poiStreetAddress = foursquareData.location.formattedAddress[0];
        // Gets the POI's City, State, and Zip Code
        self.poiCityStateZipCode = foursquareData.location.formattedAddress[1];

        // If the Foursquare API call fails
    }).fail(function () {
        alert("The Foursquare API call returned an error.");
    });

    // Adds new Google Marker
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(locationData.lat, locationData.long),
        title: locationData.name,
        map: googleMap,
        icon: defaultIconColor,
        animation: google.maps.Animation.DROP
    });


    // Declaring New InfoWindow Object
    // The content is added to InfoWindow when clicked
    // Added poi as a prefix to avoid confusion with Google's InfoWindow Object
    this.poiInfoWindow = new google.maps.InfoWindow();

    // If a marker is clicked
    this.marker.addListener('click', function () {
        self.poiInfoWindow.setContent(
            '<div class="info-window-content">' +
            '<div class="title">' +
            '<b>' + locationData.name + '</b>' +
            '</div>' +
            '<div class="content">' +
            '<a href="' + self.poiWebsite + '">' + self.poiWebsite + '</a></div>' +
            '<div class="content">' + self.poiStreetAddress + "</div>" +
            '<div class="content">' + self.poiCityStateZipCode + "</div>" +
            '<div class="content">' +
            '<a href="tel:' + self.poiPhoneNumber + '">' + self.poiPhoneNumber + '</a></div>' +
            '</div>')

        self.poiInfoWindow.open(googleMap, this);

        // Using Google's BOUNCE Animation 
        // Timeout in Milliseconds 
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 950);
    });

    // Credit: Udacity's, "Understanding API Services" Lessons
    this.marker.addListener('mouseover', function () {
        this.setIcon(highlightedIconColor);
    });
    this.marker.addListener('mouseout', function () {
        this.setIcon(defaultIconColor);
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
    this.poiList = ko.observableArray([]);

    // Initiates Google Map with styles defined in the beginning of the script
    googleMap = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 32.1533973,
            lng: -80.7606692
        },
        zoom: 14.25,
        styles: mapCustomStyle
    });

    // Passes locations through the pointOfInterest model
    starterLocations.forEach(function (poiData) {
        self.poiList.push(new pointOfInterest(poiData));
    });

    // Filtered search using Knockout
    this.sidebarSearchList = ko.computed(function () {
        // searchTerm() = the input from the Side Bar text box
        var userInput = self.searchTerm().toLowerCase();
        // For every key entered, the list is searched using Knockout's 
        // "valueUpdate: afterkeydown" and "arrayFilter" functions
        if (userInput) {
            return ko.utils.arrayFilter(self.poiList(), function (poiData) {
                var poiLowerCase = poiData.name.toLowerCase();
                var searchResult = (poiLowerCase.search(userInput) >= 0);
                // Only displays POI's that match the searchResult's
                poiData.visible_bool(searchResult);
                poiData.marker.setVisible(searchResult);


                return searchResult;
            });
            // If no input from user, display all POI's
        } else {
            self.poiList().forEach(function (poiData) {
                poiData.visible_bool(true);
                poiData.marker.setVisible(true);
            });
            return self.poiList();
        }
    }, self);

    // Closes all InfoWindows when the map is clicked
    google.maps.event.addListener(googleMap, 'click', function () {
        self.poiList().forEach(function (poiData) {
            poiData.poiInfoWindow.close();
        });
    });
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert('Google Maps has failed to load.' +
        'Please check your internet connection and try again.');
}