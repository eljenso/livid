var Q = require('q'),
    Mopidy = require('mopidy'),
    config = require('../config.js');

var models = require('./models.js');

var playlistManager = require('./playlistManager.js'),
    historyManager = require('./historyManager.js'),
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

          if (process.env.ENV !== 'prod') {
            // Clear current playlist
            return mopidy.tracklist.clear();
          }
          return 'true';
        })
        .then(function () {
          return playlistManager.repopulateDB();
        })
        .then(function () {
          return queueNextTrack(true);
        })
        .then(function () {
          // Start playing music
          mopidy.playback.play();
        })
        .fail(function (err) {
          console.log(err);
        })
        .done();
  });

  mopidy.on('event:trackPlaybackStarted', function (track) {
    track = track.tl_track.track;
    var currentTrack = new models.Track(
      track.artists[0].name,
      track.name,
      track.uri,
      0,
      '',
      track.length
    );

    socket.sendTrack(true, currentTrack);

    socket.broadcastUpcomingTracks();

  });

  mopidy.connect();
}



function getCurrentTrack () {
  var deferred = Q.defer();

  mopidy.playback.getCurrentTrack()
    .then(function (track) {
      if (track) {
        deferred.resolve(new models.Track(
          track.artists[0].name,
          track.name,
          track.uri,
          0,
          '',
          track.length
        ));
      } else {
        deferred.reject('No current track');
      }
    })
    .done();

  return deferred.promise;
}


function checkInit() {
  var deferred = Q.defer();

  Q.all([mopidy.playback.getCurrentTrack(), mopidy.playback.getTimePosition()])
    .spread(function(currentTrack, timePosition) {
      if (currentTrack) {
        setTimeout(function () {
          queueNextTrack();
        }, currentTrack.length - timePosition - 10*1000);
        deferred.reject('Already playing!');
      } else {
        deferred.resolve()
      }
    })
    .done();

  return deferred.promise;
}

function queueNextTrack (isInit) {
  var deferred = Q.defer();
  var trackUri;

  Q()
    .then(function() {
      if (isInit) {
        return checkInit();
      } else {
        return true;
      }
    })
    .then(function() {
      return playlistManager.getNextTracks(1);
    })
    .then(function (nextTracks) {
      // 5 seconds before the current track stops, queue next track
      setTimeout(function () {
        queueNextTrack();
      }, nextTracks[0].length - (firstSong ? 10*1000 : 0));
      firstSong = false;
      socket.sendTrack(false, nextTracks[0]);
      socket.broadcastUpcomingTracks();
      trackUri = nextTracks[0].uri;
      return mopidy.tracklist.add(null, null, nextTracks[0].uri, null);
    })
    .then(function () {
      return historyManager.addToHistory(trackUri);
    })
    .then(function () {
      return playlistManager.removeNextTrack();
    })
    .then(function () {
      deferred.resolve();
    })
    .fail(function(err) {
      deferred.reject(err);
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
        convertedResults.push(new models.Track(
          concatenatedResults[i].artists[0].name,
          concatenatedResults[i].name,
          concatenatedResults[i].uri,
          0,
          '',
          concatenatedResults[i].length
        ));

        if (concatenatedResults.length === convertedResults.length) {
          deferred.resolve(convertedResults);
        };

      };
    })
    .done();

  return deferred.promise;
};

exports.init = init;

exports.getCurrentTrack = getCurrentTrack;
exports.searchTrack = searchTrack;
