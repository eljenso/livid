/**
 * Copyright(c) 2014 Jens Böttcher <eljenso.boettcher@gmail.com
 */


$(function () {
  'use strict';
  var socket = io();

  socket.on('ping', function (message) {
    console.log(message);
  });

}()); // end strict mode