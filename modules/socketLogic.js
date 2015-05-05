module.exports = function(listener) {

  var io = require('socket.io')(listener);

  io.on('connection', function (socket) {

      socket.emit('ping', 'what up');

      socket.on('burp', function () {
          console.log('Hello World!');
      });
  });

  this.io = io;
};