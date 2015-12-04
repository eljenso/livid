var Q = require('q'),
    nedb = require('nedb'),
    config = require('../config.js');


var dbHandler = require('../modules/dbHandler.js');
var socket = require('./socketLogic.js');
var models = require('../modules/models.js');

var playlistManager = {
  defaultTracks: []
}

playlistManager.setDefaultTracks = function (tracks) {
  playlistManager.defaultTracks = tracks;
}


playlistManager.repopulateDB = function (tracks) {
  var deferred = Q.defer();

  if (!tracks) {
    tracks = playlistManager.defaultTracks;
  };

  tracks = tracks
    .sort(function() {
      return 0.5 - Math.random()}
    )
    .slice(0, 50);

  var savedTracks = 0;
  for (var i = tracks.length - 1; i >= 0; i--) {
    var track = new models.Track(
      tracks[i].artists[0].name,
      tracks[i].name,
      tracks[i].uri,
      0,
      '',
      tracks[i].length
    );

    dbHandler.saveTrack(track)
      .then(function(savedTrack) {
        savedTracks++;
        if (savedTracks === tracks.length) {
          deferred.resolve();
        };
      })
      .fail(function(err) {
        deferred.reject(err);
      })
      .done();
  };

  return deferred.promise;
};


playlistManager.getNextTracks = function (numberOfTracks) {
  var deferred = Q.defer();

  if (isNaN(numberOfTracks)) {
    numberOfTracks = 10;
  };

  dbHandler.getNextTracks('queue', numberOfTracks)
    .then(function (nextTracks) {
      deferred.resolve(nextTracks);
    })
    .fail(function(err) {
      deferred.reject(err);
    })
    .done();

  return deferred.promise;
}


playlistManager.removeNextTrack = function() {
  playlistManager.getNextTracks(1)
    .then(function (nextTracks) {
      return dbHandler.deleteTrack(nextTracks[0].uri);
    })
    .fail(function(err) {
      if (err) return console.error(err);
    })
    .done();
};


playlistManager.addTrack = function(newTrack) {
  dbHandler.getTrack(newTrack.uri)
    .then(function(track) {
      // Only add track if not already in queue
      if (track) {
        // Vote track up if already in queue
        playlistManager.voteUp(newTrack.uri);
      } else {
        track = new QueueTrack(newTrack);

        return dbHandler.saveTrack(track)
          .then(function(savedTrack) {
            socket.broadcastUpcomingTracks();
          })
          .fail(function(err) {
            deferred.reject(err);
          })
          .done();
      }
    })
    .fail(function(err) {
      if (err) return console.error(err);
    })
    .done();
};


playlistManager.voteUp = function (trackUri) {
  dbHandler.voteUp(trackUri, 'queue')
    .then(function(newTrack) {
      socket.broadcastUpcomingTracks();
    })
    .fail(function(err) {
      if (err) return console.error(err);
    })
    .done();
};


exports.setDefaultTracks = playlistManager.setDefaultTracks;
exports.removeNextTrack = playlistManager.removeNextTrack;
exports.repopulateDB = playlistManager.repopulateDB;
exports.getNextTracks = playlistManager.getNextTracks;
exports.addTrack = playlistManager.addTrack;
exports.voteUp = playlistManager.voteUp;
