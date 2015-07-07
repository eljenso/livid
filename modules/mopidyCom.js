var Q = require('q'),
    Mopidy = require('mopidy'),
    config = require('../config.js'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track');

var playlistManager = require('./playlistManager.js'),
    socket = require('./socketLogic.js');

var playlistTracks,
    mopidy,
    queueTimeout;

var firstSong = true;


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
          // Init playlist manager with default tracks
          playlistManager.setDefaultTracks(tracks);

          // Clear current playlist
          return mopidy.tracklist.clear();
        })
        .then(function () {
          return playlistManager.repopulateDB();
        })
        .then(function () {
          return queueNextTrack();
        })
        .then(function () {
          // Start playing music
          mopidy.playback.play();
        })
        .done();
  });

  mopidy.on('event:trackPlaybackStarted', function (track) {
    track = track.tl_track.track;
    Track.convert(track, function (currentTrack) {
      socket.sendTrack(true, currentTrack);
    });

    socket.broadcastUpcomingTracks();

  });

  mopidy.connect();
}



function getCurrentTrack () {
  var deferred = Q.defer();

  mopidy.playback.getCurrentTrack()
    .then(function (track) {
      if (track) {
        Track.convert(track, function (currentTrack) {
          deferred.resolve(currentTrack);
        })
      } else {
        deferred.reject('No current track');
      }
    })
    .done();

  return deferred.promise;
}


function queueNextTrack () {
  var deferred = Q.defer();

  // clear old timeout!
  clearInterval(queueTimeout);

  playlistManager.getNextTracks(1)
    .then(function (nextTracks) {
      // 5 seconds before the current track stops, queue next track
      queueTimeout = setInterval(function () {
        queueNextTrack();
      }, nextTracks[0]._doc.length - (firstSong ? 10*1000 : 0));
      firstSong = false;
      socket.sendTrack(false, nextTracks[0]._doc);
      socket.broadcastUpcomingTracks();
      return mopidy.tracklist.add(null, null, nextTracks[0]._doc.uri, null);
    })
    .then(function () {
      return playlistManager.removeNextTrack();
    })
    .then(function () {
      deferred.resolve();
    })
    .done();

  return deferred.promise;
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

function searchTrack (query) {
  var deferred = Q.defer();

  mopidy.library.search({'any': [query]})
    .then(function (results) {

      var concatenatedResults = []
      for (var i = 0; i < results.length; i++) {
        if (results[i].tracks) {
          concatenatedResults = concatenatedResults.concat(results[i].tracks);
        };
      };

      var convertedResults = [];
      for (var i = 0; i < concatenatedResults.length; i++) {
        Track.convert(concatenatedResults[i], function (currentTrack) {
          convertedResults.push(currentTrack);

          if (concatenatedResults.length === convertedResults.length) {
            deferred.resolve(convertedResults);
          };
        })
      };
    })
    .done();

  return deferred.promise;
};

exports.init = init;

exports.getCurrentTrack = getCurrentTrack;
exports.searchTrack = searchTrack;
