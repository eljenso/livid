var Q = require('q'),
    Mopidy = require('mopidy'),
    config = require('../config.js');

var playlistTracks, mopidy;

function init () {
  mopidy = Mopidy({
    webSocketUrl: config.mopidy.adress,
    autoConnect: false,
    callingConvention: 'by-position-only'
  });

  mopidy.on("state:online", function () {
      getPlaylistTracks(config.mopidy.defaultPlaylist)
        .then(function (tracks) {
          playlistTracks = tracks;
        })
        .done();
      mopidy.playback.next();
  });

  mopidy.connect();
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