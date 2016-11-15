<?php

    require(__DIR__ . "/../includes/config.php");

    // ensure proper usage
    if (!isset($_GET["sw"], $_GET["ne"]))
    {
        http_response_code(400);
        exit;
    }

    // ensure each parameter is in lat,lng format
    if (!preg_match("/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/", $_GET["sw"]) ||
        !preg_match("/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/", $_GET["ne"]))
    {
        http_response_code(400);
        exit;
    }

    // explode southwest corner into two variables
    list($sw_lat, $sw_lng) = explode(",", $_GET["sw"]);

    // explode northeast corner into two variables
    list($ne_lat, $ne_lng) = explode(",", $_GET["ne"]);

    // find 10 cities within view, pseudorandomly chosen if more within view
    if ($sw_lng <= $ne_lng)
    {
        // doesn't cross the antimeridian
        if ($_GET["disp"] == "pop" || $_GET["disp"] != "rand") // Sort by population (default)
        {
            $rows = CS50::query("SELECT placesinno.postal_code,placesinno.place_name,placesinno.admin_name1,placesinno.admin_code1,placesinno.latitude,placesinno.longitude,population.popestimate2015 FROM placesinno LEFT JOIN population ON placesinno.populationid = population.id WHERE ? <= latitude AND latitude <= ? AND (? <= longitude AND longitude <= ?) GROUP BY country_code, place_name, admin_code1 ORDER BY popestimate2015 DESC LIMIT 10", $sw_lat, $ne_lat, $sw_lng, $ne_lng);
        }
        
        else if ($_GET["disp"] == "rand")
        {
            // original behavior (random)
            $rows = CS50::query("SELECT * FROM placesinno WHERE ? <= latitude AND latitude <= ? AND (? <= longitude AND longitude <= ?) GROUP BY country_code, place_name, admin_code1 ORDER BY RAND() LIMIT 10", $sw_lat, $ne_lat, $sw_lng, $ne_lng);
        }
    }
    else
    {
        // crosses the antimeridian
        if ($_GET["disp"] == "pop" || $_GET["disp"] != "rand") // Sort by population (default)
        {
            $rows = CS50::query("SELECT placesinno.postal_code,placesinno.place_name,placesinno.admin_name1,placesinno.admin_code1,placesinno.latitude,placesinno.longitude,population.popestimate2015 FROM placesinno LEFT JOIN population ON placesinno.populationid = population.id WHERE ? <= latitude AND latitude <= ? AND (? <= longitude OR longitude <= ?) GROUP BY country_code, place_name, admin_code1 ORDER BY popestimate2015 DESC LIMIT 10", $sw_lat, $ne_lat, $sw_lng, $ne_lng);
        }
        else if ($_GET["disp"] == "rand")
        {
            // original behavior (random)
            $rows = CS50::query("SELECT * FROM placesinno WHERE ? <= latitude AND latitude <= ? AND (? <= longitude OR longitude <= ?) GROUP BY country_code, place_name, admin_code1 ORDER BY RAND() LIMIT 10", $sw_lat, $ne_lat, $sw_lng, $ne_lng);
        }
    }
    
    // NEW FEATURE: take in postal code query to ensure inclusion of a certain place (useful for showing marker of city selected from search suggestions)
    if($_GET["q"] != "")
    {
        // append query'd city's row onto array
        $newRow = CS50::query("SELECT placesinno.postal_code,placesinno.place_name,placesinno.admin_name1,placesinno.admin_code1,placesinno.latitude,placesinno.longitude,population.popestimate2015 FROM placesinno LEFT JOIN population ON placesinno.populationid = population.id WHERE placesinno.postal_code = ?", $_GET["q"]);
        array_push($rows, $newRow[0]);
    }

    // REMOVE DUPLICATE ENTRIES
    for ($i = 0, $n = count($rows) - 1; $i < $n; $i++)
    {
        if ($rows[$n]["place_name"] == $rows[$i]["place_name"] && $rows[$n]["admin_code1"] == $rows[$i]["admin_code1"])
        {
            unset($rows[$i]);
        }
    }
    // remove indexs from the array to prepare for json_encode()
    $rows = array_values($rows);

    // output places as JSON (pretty-printed for debugging convenience)
    header("Content-type: application/json");
    print(json_encode($rows, JSON_PRETTY_PRINT));

?>