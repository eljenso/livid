var Q = require('q'),
    config = require('../config.js'),
    mongoose = require('mongoose'),
    QueueTrack = mongoose.model('QueueTrack');

var socket = require('./socketLogic.js');

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
    QueueTrack.convert(tracks[i], function (track) {
      track = new QueueTrack(track);

      track.save(function (err, track) {
        if (err) return console.error(err);
        savedTracks++;
        if (savedTracks === tracks.length) {
          deferred.resolve();
        };
      });
    });
  };

  return deferred.promise;
};


playlistManager.getNextTracks = function (numberOfTracks) {
  var deferred = Q.defer();

  if (isNaN(numberOfTracks)) {
    numberOfTracks = 10;
  };

  var query = QueueTrack.find().sort('-rating dateAdded').limit(numberOfTracks);
  var promise = query.exec();
  promise.addBack(function (err, tracks) {
    if (err) return console.error(err);
    if (tracks.length < numberOfTracks) {
      playlistManager.repopulateDB()
        .then(function () {
          return playlistManager.getNextTracks(numberOfTracks);
        })
        .then(function (nextTracks) {
          deferred.resolve(nextTracks);
        })
        .done();
    } else {
      deferred.resolve(tracks);
    }
  });

  return deferred.promise;
}


playlistManager.removeNextTrack = function() {
  playlistManager.getNextTracks(1)
    .then(function (nextTracks) {
      QueueTrack.remove({uri: nextTracks[0]._doc.uri}, function (err) {
        if (err) return console.error(err);
      });
    })
    .done();
}


playlistManager.addTrack = function(newTrack) {
  QueueTrack.findOne({ 'uri': newTrack.uri }, function (err, track) {
    if (err) return console.error(err);

    // Only add track if not already in queue
    if (track !== undefined) {
      // Vote track up if already in queue
      playlistManager.voteUp(newTrack.uri);
    } else {
      track = new QueueTrack(newTrack);

      track.save(function (err, track) {
        if (err) return console.error(err);
        socket.broadcastUpcomingTracks();
      });
    }
  });
}


playlistManager.voteUp = function (trackUri) {
  QueueTrack.findOne({ 'uri': trackUri }, function (err, track) {
    if (err) return console.error(err);

    track.rating++;
    track.save(function (err, track) {
      if (err) return console.error(err);
      socket.broadcastUpcomingTracks();
    });
  });
}


exports.setDefaultTracks = playlistManager.setDefaultTracks;
exports.removeNextTrack = playlistManager.removeNextTrack;
exports.repopulateDB = playlistManager.repopulateDB;
exports.getNextTracks = playlistManager.getNextTracks;
exports.addTrack = playlistManager.addTrack;
exports.voteUp = playlistManager.voteUp;
