The geonames data had some incorrect coordinate entries, made evident by overlapping with others.

Example query of overlapping data in Massachusetts:
SELECT p1.id, p1.postal_code, p1.place_name, p1.latitude, p1.longitude, p2.postal_code, p2.place_name, p2.latitude, p2.longitude
FROM `placesinno` p1, `placesinno` p2
WHERE p1.`admin_name1` = "Massachusetts"
AND p1.`place_name` != p2.`place_name`
AND p1.`latitude` = p2.`latitude`
AND p1.`longitude` = p2.`longitude`;

fixlocation (fix) is a php program that selects the rows with overlapping coordinates, utilizes the datasciencetoolkit api to store
the more accurate coordinates in a json object, and then updates the latitude and longitude within the table using this new data.
A few overlaps still remained, so a second pass (fix-2ndpass) was performed using the openstreetmap api.

api: http://www.datasciencetoolkit.org/developerdocs#googlestylegeocoder
api: http://wiki.openstreetmap.org/wiki/Nominatim