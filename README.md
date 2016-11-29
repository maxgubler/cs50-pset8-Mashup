# cs50-pset8-Mashup
Display news markers upon cities and towns across the US with an interactive display of data from both the Google Maps API and Google News API. Javascript / JQuery, DOM manipulation, AJAX, PHP.

# Completed features & improvements beyond assignment requirements:

CENTERED MAP ON URI PROVIDENCE CAMPUS

IMPROVED SEARCH SUGGESTIONS
    -Give suggestions based on partially typed city/town names
    -Removed duplicate city/town suggestions
    -Give suggestions based on partially typed postal codes (and sort in ascending order)
    -Retain duplicates when searching with partially typed postal code
    -Was able to implement FULLTEXT, but prefered the functionality of LIKEs, %s, and concatenations
        -See /public/search.php for more information

SHOW MARKER FOR SEARCH RESULT
    -When searching for a place, upon selection, show its marker and open an info window / news list
    -Passes a special argument (isSearch == true) when typeahead:selected calls update()
    -Update() makes use of the getJSON deferred object and we use .then to delay triggering a click of this
     selected marker (which allows the markers to load and everything to function smoothly)

DISPLAY MARKERS BASED UPON HIGHEST POPULATION SIZE (rather than semi-random)
    -Imported census/population data into a separate table (import-census)
    -Culled duplicate/extraneous entries within census data (censusdbstrip)
    -Linked population table with places table (placesinno) via `id` and `populationid` (updatepopid)
        -See /bin/census/readme.txt for more information
        
MARKER DISPLAY SELECTOR - Radio buttons
    -By population (Set as new default)
    -Random (Original behavior)
    
FIXED GEONAMES DATASET - Removed Incorrect / Overlapping Coordinates
    -fixlocation (fix) is a php program written to select the incorrect rows, then update/set with new api data
        -See /bin/fixlocation/readme.txt for more information

TODO:
    -Refine population table - The US census csv lacks some places (ex: Allston, MA; Brighton, MA)
    -Map marker labels overlap (Known issue / library no longer supported by google)
        -See: /js/hnl.collision.detection.js (bottom vs top issue preventing implementation)
-See: jQueryUI .position() collision detection
