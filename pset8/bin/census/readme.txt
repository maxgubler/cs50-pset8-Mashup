Feature: Weight map markers by population size


Created table from CSV (original_data/SUB-EST2015_ALL.csv)
http://www.census.gov/popest/data/cities/totals/2015/SUB-EST2015.html

Linked table with original places table (derived from geonames)

census-stripped.csv had indicators such as town, city, borough, township removed through a simple find/replace text editor

import-census is a php program written to import the census data into a table (see inside to ensure proper table name)

censusdbstrip is a php program written to remove duplicate entries, selecting the highest population if there is a discrepancy
(Syntax: ./censusdbstrip -lowpop|id|both -select|del (State))

updatepopid is a php program linking the places table and census (population) table, storing a populationid relative to the census id
(See inside, top to set table names)

A column was later added to the population table to explain manual entries