<?php

    require(__DIR__ . "/../includes/config.php");

    // numerically indexed array of places
    $places = [];

    // Created fulltext joint index with command: ALTER TABLE places ADD FULLTEXT (postal_code,place_name);
    // For simple information on FULLTEXT joint index: http://clagnut.com/blog/262
    // You can see indexes with: SHOW INDEXES FOR places
    // If there is a duplicate, you may wish to drop that index, ex: ALTER TABLE places DROP INDEX postal_code_2;
    
    // DONE: search database for places matching $_GET["geo"], store in $places
    
    // The comment below is similar to the https://mashup.cs50.net/ implementation using FULLTEXT
    // $places = CS50::query("SELECT * FROM places WHERE MATCH(postal_code, place_name, admin_name1) AGAINST (?)", $_GET["geo"]);
    // This requires the MyISAM table `places` which has the FULLTEXT index
    
    // Remove any commas from user query to standardize input for easier database query
    $geo = str_replace(",", "", $_GET["geo"]);
    
    // If query is not a postal code / numeric, query with place_name and state (admin_name1 or admin_code1)
    if (is_numeric($geo) != 1){
        $places = CS50::query("SELECT place_name, admin_name1, admin_code1, postal_code, latitude, longitude FROM placesinno WHERE CONCAT(place_name, ' ', admin_code1) LIKE ? OR CONCAT(place_name, ' ', admin_name1) LIKE ? LIMIT 100", '%' . $geo . '%', '%' . $geo . '%');
        
        // REMOVE DUPLICATE ENTRIES (if query is not a postal code / numeric)
        for ($i = 0, $n = count($places); $i < $n; $i++)
        {
            if (isset($places[$i]))
            {
                for ($j = $i + 1; $j < $n; $j++)
                {
                    if (isset($places[$j]) && $places[$i]["place_name"] == $places[$j]["place_name"] && $places[$i]["admin_code1"] == $places[$j]["admin_code1"])
                    {
                        unset($places[$j]);
                    }
                }
            }
        }
        // remove indexs from the array to prepare for json_encode()
        $places = array_values($places);
    }
    // If query is numeric, it is likely a postal code (and we will allow duplicate place names)
    else
    {
        $places = CS50::query("SELECT place_name, admin_name1, admin_code1, postal_code, latitude, longitude FROM placesinno WHERE postal_code LIKE ? ORDER BY postal_code ASC LIMIT 100", $geo . '%');
    }
    
    // output places as JSON (pretty-printed for debugging convenience)
    header("Content-type: application/json");
    print(json_encode($places, JSON_PRETTY_PRINT));

?>