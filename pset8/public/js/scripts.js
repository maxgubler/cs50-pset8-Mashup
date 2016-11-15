/* global google */
/* global _ */
/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// NEW FEATURE: Inialize global result display as default (by population)
var resdisp = "default";

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    
    // Recall that [ and ] denote an array, while { and } denote an object. 
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 41.8234792, lng: -71.4140295}, // URI Providence Campus
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);
    

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);
    
    // NEW FEATURE: Result Display Radio Button (Highest Population or Random)
    // see index.html form for related input
    // set the display to the previously checked box (to prevent reverting to default)
    resdisp = $("input[name='resultdisplay']:checked").val();
    // after click, use the newly checked button to update the resdisp global variable and map
    $("input[name='resultdisplay']").on("click", function() {
        resdisp = $("input[name='resultdisplay']:checked").val();
        // update() determines which display mode to use by passing resdisp to update.php
        update();
    });

});

/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
    /* CREATE MARKER */
    
    // create variable to be used for marker.position
    var markerLatLng = {lat: parseFloat(place.latitude), lng: parseFloat(place.longitude)};
    // LatLng reference: https://developers.google.com/maps/documentation/javascript/reference#LatLng

    // create marker object
    var marker = new MarkerWithLabel({
       position: markerLatLng,
       map: map,
       labelContent: place.place_name + ", " + place.admin_name1,
       labelAnchor: new google.maps.Point(22, 0),
       labelClass: "label", // the CSS class for the label
       icon: "https://maps.google.com/mapfiles/kml/pal2/icon31.png"
     });
     
    // add marker object to an array of markers (so we can later removeMarkers() when map is updated, ex: zoom or pan)
    markers.push(marker);
    
    
    /* NEW FEATURE: CREATE MARKER INFOWINDOW */
    
    // On click, open info window, then get article content with getJSON
    /* 
     * infoWindow details: http://stackoverflow.com/questions/1875596/have-just-one-infowindow-open-in-google-maps-api-v3
     * showInfo() is a more advanced form of:
     *    infowindow.setContent('Hello World');
     *    infowindow.open(map, this);
     *
     * note: getJSON was put inside listener to prevent spam/preload of all places' content
     * optional cache, we could use:
     *      if (content === undefined) {showInfo(...); $.getJSON(...).done(...)}
     *      else{showInfo(...)}
     */
    
    // initialize undefined content so showInfo() will at least show spinner/loading gif
    var content;
    
    google.maps.event.addListener(marker, 'click', function() {
        // call showInfo with undefined content to show loading spinner
        showInfo(marker, content);
        
        // use getJSON to parse JSON data derived from the google news rss feed
        $.getJSON("articles.php", { geo: place.postal_code }, function(result) {
            // result is an array of objects with properties link and title
            // begin content
            content = '<ul>\n';
            // iterate through result array to add all list items
            $.each(result, function(articleIndex) {
                content += '<li><a target="_blank" href="' + result[articleIndex].link + '">' + result[articleIndex].title + '</a></li>\n';
            });
            // finish content
            content += '</ul>';
        })
        .done(function() {
            // call showInfo once more to pass in our newly acquired content
            showInfo(marker, content);
        });
     });
}

/**
 * Configures application.
 */
function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {
        update();
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // remove markers whilst dragging
    google.maps.event.addListener(map, "dragstart", function() {
        removeMarkers();
    });

    // configure typeahead
    // https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
    $("#q").typeahead({
        autoselect: true,
        highlight: true,
        minLength: 1
    },
    {
        source: search,
        templates: {
            empty: "no places found yet",
            // the <%- ensures that the value will be escaped, a la PHP’s htmlspecialchars, per http://underscorejs.org/#template
            suggestion: _.template('<p><span class="place_name"><%- place_name %>, <%- admin_name1 %></span> <span class="postal_code"><%- postal_code %></span></p>')
        }
    });

    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // ensure coordinates are numbers
        var latitude = (_.isNumber(suggestion.latitude)) ? suggestion.latitude : parseFloat(suggestion.latitude);
        var longitude = (_.isNumber(suggestion.longitude)) ? suggestion.longitude : parseFloat(suggestion.longitude);

        // set map's center
        map.setCenter({lat: latitude, lng: longitude});
        
        // NEW FEATURE: Add marker to selected search location after recentering map to its coordinates
        // set form query value to selected postal code which will eventually be passed to update.php (which returns json markers)
        $("#q").val(suggestion.postal_code);

        // update UI
        // pass in true to indicate we wish to add a marker / open its info window specifically for this location
        update(true);
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        hideInfo();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();
    
    // enable clicking of changelog button
    onClickChangelog();

    // give focus to text box
    $("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo()
{
    info.close();
}

/**
 * Removes markers from map.
 */
function removeMarkers()
{
    // https://developers.google.com/maps/documentation/javascript/markers#remove
    // iterate over each marker object in the global markers array to remove (hide) them from map
    for (var marker of markers)
    {
        marker.setMap(null);
    }
    // remove all reference to the markers to delete them (as opposed to simply hiding them)
    markers = [];
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb)
{
    // get places matching query (asynchronously)
    var parameters = {
        geo: query
    };
    $.getJSON("search.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // call typeahead's callback with search results (i.e., places)
        cb(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 */
function update(isSearch) 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        // New Feature: choose marker display mode (population/random)
        // resdisp value (default or based on index.html radio button selection) will be passed into update.php as parameter 'disp'
        disp: resdisp, 
        sw: sw.lat() + "," + sw.lng()
    };

    $.getJSON("update.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // remove old markers from map
        removeMarkers();

        // add new markers to map
        for (var i = 0; i < data.length; i++)
        {
            addMarker(data[i]);
        }
    })
    .then(function(){
        // new feature: 
        // check if this update() was initated by selecting a search suggestion (which passed in true)
        // simulate click on the last marker in the array (to open info window)
        // last marker in array corresponds to the search query thanks to update.php (it ensures this query's marker is pushed)
        if (isSearch == true){
            google.maps.event.trigger(markers[markers.length - 1], 'click');
            $("#q").val("");
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
}

// Initalize informational dialog box
function initDialog() {
    var dialogWidth = $( window ).width() * 0.5;
    var dialogHeight = $( window ).height() * 0.7;
    
    $( "#dialog" ).dialog({
        autoOpen: false,
        appendTo: ".container-fluid",
        width: dialogWidth,
        height: dialogHeight,
        /*buttons: [{
            text: "OK",
            icons: {
                primary: "ui-icon-heart"
            },
            click: function() {
                $( this ).dialog( "close" );
            }
        }]*/
    });
    
    $("#readme").load("readme.php");
}

function onClickChangelog() {
    $( "#opener" ).click(function() {
        initDialog();
        $( "#dialog" ).dialog( "open" );
    });
}