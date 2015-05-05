/**
 * Configuration file
 */

var config = {};


// Main variables
config.main = {};
config.main.port = process.env.PORT || 3000;


// Mopidy
config.mopidy = {};
config.mopidy.adress = 'ws://127.0.0.1:6681/mopidy/ws/';
config.mopidy.defaultPlaylist = 'Einweihung';


module.exports = config;