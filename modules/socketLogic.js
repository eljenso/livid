var socketIO = require('socket.io'),
    config = require('../config.js'),
    playlistManager = require('./playlistManager.js'),
    mopidyCom = require('./mopidyCom.js');

var io;

/**
 * Send current queue to a specific socket
 * @param  {Socket} socket Socket which will receive the queue
 */
function sendNextTracks (socket) {
  playlistManager.getNextTracks(20)
    .then(function (nextTracks) {
      socket.emit('nextTracks', nextTracks);
    })
    .done();
}

/**
 * Send current queue to all sockets
 */
function broadcastUpcomingTracks () {
  setTimeout(function () {
    playlistManager.getNextTracks(20)
      .then(function (nextTracks) {
        io.sockets.emit('nextTracks', nextTracks);
      })
      .done();
  }, 200);
}

/**
 * Send new next/current track to all sockets
 * @param  {Boolean} isCurrent Whether track is the current track or not
 * @param  {Track}  track     The track to send
 */
function sendTrack (isCurrent, track) {
  var broadcastEvent = (isCurrent ? 'currentTrack' : 'nextTrack');
  io.sockets.emit(broadcastEvent, track);
}

function init(listener) {
  io = socketIO(listener);


  io.on('connection', function (socket) {
      /*
       * Send current status
       */
      // Current track
      mopidyCom.getCurrentTrack()
        .then(function (track) {
          socket.emit('currentTrack', track);
        })
        .fail(function (message) {
          console.log(message);
        })
        .done();

      // Current queue
      sendNextTracks(socket);


      /*
       * Setup voting
       */
      var votedRecently = false;
      var alreadyVotedFor = [];

      /**
       * Set votedRecently true and reset to false after timeout
       */
      function voteTimeout () {
        votedRecently = true;
        setTimeout(function () {
          votedRecently = false;
        }, config.user.voteDelay);
      }

      // New track was received
      socket.on('addTrack', function (track) {
        if (!votedRecently) {
          alreadyVotedFor.push(track.uri);
          track.rating = 1;
          playlistManager.addTrack(track);
          voteTimeout();
          broadcastUpcomingTracks();
        } else {
          socket.emit('alreadyVoted', 'recently');
        }
      });

      // Vote for track was received
      socket.on('voteUp', function (trackUri) {
        if (!votedRecently && alreadyVotedFor.indexOf(trackUri) < 0) {
          alreadyVotedFor.push(trackUri);
          playlistManager.voteUp(trackUri);
          voteTimeout();
          broadcastUpcomingTracks();
        } else if (alreadyVotedFor.indexOf(trackUri) >= 0) {
          socket.emit('alreadyVoted', 'thisSong');
        } else {
          socket.emit('alreadyVoted', 'recently');
        }
      });


      socket.on('search', function (query) {
        mopidyCom.searchTrack(query)
          .then(function (result) {
            socket.emit('searchResult', result);
          })
          .done();
      })

  });

};

exports.init = init;
exports.io = io;
exports.sendTrack = sendTrack;
exports.broadcastUpcomingTracks = broadcastUpcomingTracks;
