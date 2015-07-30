/**
 * Configuration file
 */

var config = {
  main: {
    port: process.env.PORT || 3000
  },
  mopidy:{
    adress: 'ws://127.0.0.1:6680/mopidy/ws/',
    defaultPlaylist: 'Party 2015'
  },
  db: 'mongodb://localhost/livid',
  user: {
    voteDelay: 60 * 1000
  }
};

module.exports = config;
