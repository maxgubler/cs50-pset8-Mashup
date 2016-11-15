--
-- Database: `pset8`
-- Census csv data example:
-- SUMLEV,STATE,COUNTY,PLACE,COUSUB,CONCIT,PRIMGEO_FLAG,FUNCSTAT,NAME,STNAME,CENSUS2010POP,ESTIMATESBASE2010,POPESTIMATE2010,POPESTIMATE2011,POPESTIMATE2012,POPESTIMATE2013,POPESTIMATE2014,POPESTIMATE2015
-- 162,   01,   000,   00124,00000, 00000, 0,           A, Abbeville city,Alabama,2688,2688,2682,2686,2649,2634,2622,2620

CREATE DATABASE IF NOT EXISTS  `pset8`;


--
-- Table structure for table `places`
--

CREATE TABLE IF NOT EXISTS `pset8`.`census` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place` varchar(180) NOT NULL,
  `state` varchar(100) NOT NULL,
  `popestimate2015` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM;