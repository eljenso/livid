var Q = require('q'),
    Mopidy = require('mopidy'),
    config = require('../config.js');

var playlistTracksBackup;
var playlistTracks = [];
var userTracks = [];
var mopidy;

var queueTimeout;


function init () {
  mopidy = Mopidy({
    webSocketUrl: config.mopidy.adress,
    autoConnect: false,
    callingConvention: 'by-position-only'
  });

  mopidy.on("state:online", function () {
      // Get fallback playlist
      getPlaylistTracks(config.mopidy.defaultPlaylist)
        .then(function (tracks) {
          // Save randomized fallback playlist
          playlistTracksBackup = tracks.sort(function() {
            return 0.5 - Math.random()}
          );
          // Clear current playlist
          return mopidy.tracklist.clear();
        })
        .then(function () {
          // Add next track to tracklist
          return queueNextTrack();
        })
        .then(function () {
          // Start playing music
          mopidy.playback.play();
        })
        .done();
  });

  mopidy.connect();
}


function queueNextTrack () {
  // clear old timeout!
  clearInterval(queueTimeout);
  
  var nextTrack;

  // 
  if (playlistTracks.length === 0) {
    playlistTracks = playlistTracksBackup;
  };

  // If no user tracks have been selected (yet), play track from fallback playlist
  if (userTracks.length > 0) {
    nextTrack = userTracks.shift();
  } else {
    nextTrack = playlistTracks.shift();
  };

  // 5 seconds before the current track stops, queue next track
  queueTimeout = setInterval(function () {
    queueNextTrack();

    //////////////////////////////////////////////////
    // Not optimal: new tracks are added too often! //
    //////////////////////////////////////////////////
  }, nextTrack.length - 2*60*1000); 

  return mopidy.tracklist.add(null, null, nextTrack.uri, null);
}

function getPlaylistTracks (playlistName) {
  var deferred = Q.defer();

  mopidy.playlists.getPlaylists()
    .then(function (playlists) {
      for (var i = 0; i < playlists.length; i++) {
        if(playlists[i].name.toLowerCase().indexOf(playlistName.toLowerCase()) > -1) {
          var tracks = playlists[i].tracks;
          deferred.resolve(tracks);
        }
      }
  });

  return deferred.promise;
}

module.exports = init;