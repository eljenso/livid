/**
 * Configuration file
 */

var config = {
  main: {
    port: process.env.PORT || 3000
  },
  mopidy:{
    adress: 'ws://127.0.0.1:6680/mopidy/ws/',
    defaultPlaylist: 'Einweihung'
  },
  db: 'mongodb://localhost/parti-q',
  user: {
    voteDelay: 30 * 1000
  }
};

module.exports = config;
