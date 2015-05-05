var Q = require('q'),
    Mopidy = require('mopidy'),
    config = require('../config.js');

var playlistTracks;
var userTracks = [];
var mopidy;

function init () {
  mopidy = Mopidy({
    webSocketUrl: config.mopidy.adress,
    autoConnect: false,
    callingConvention: 'by-position-only'
  });

  mopidy.on("state:online", function () {

      getPlaylistTracks(config.mopidy.defaultPlaylist)
        .then(function (tracks) {
          // Save fallback playlist
          playlistTracks = tracks;
          // Clear current playlist
          return mopidy.tracklist.clear();
        })
        .then(function () {
          // Add next track to tracklist
          return playNextTrack();
        })
        .then(function () {
          // Start playing music
          mopidy.playback.play();
        })
        .done();
  });

  mopidy.connect();
}


function playNextTrack () {
  var nextTrack;

  // If no user tracks have been selected (yet), play tracks from fallback playlist
  if (userTracks.length > 0) {
    nextTrack = userTracks.shift();
  } else {
    nextTrack = playlistTracks.shift();
  };

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