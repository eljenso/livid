var socketIO = require('socket.io'),
    config = require('../config.js'),
    playlistManager = require('./playlistManager.js'),
    mopidyCom = require('./mopidyCom.js');

var io;

function sendNextTracks (socket) {
  playlistManager.getNextTracks(20)
    .then(function (nextTracks) {
      socket.emit('nextTracks', nextTracks);
    })
    .done();
}

function sendTrack (isCurrent, track) {
  var broadcastEvent = (isCurrent ? 'currentTrack' : 'nextTrack');
  io.sockets.emit(broadcastEvent, track);
}

function init(listener) {
  io = socketIO(listener);

  io.on('connection', function (socket) {
      mopidyCom.getCurrentTrack()
        .then(function (track) {
          socket.emit('currentTrack', track);
        })
        .done();

      sendNextTracks(socket);

      setInterval(function () {
        sendNextTracks(socket);
      }, 1 * 1000);



      var votedRecently = false;

      function voteTimeout () {
        votedRecently = true;
        setTimeout(function () {
          votedRecently = false;
        }, config.user.voteDelay);
      }

      socket.on('addTrack', function (track) {
        if (!votedRecently) {
          playlistManager.addTrack(track);
          voteTimeout();
        };
      });

      socket.on('voteUp', function (trackUri) {
        if (!votedRecently) {
          playlistManager.voteUp(trackUri);
          voteTimeout();
        };
      });

  });

};

exports.init = init;
exports.io = io;
exports.sendTrack = sendTrack;
