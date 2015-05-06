/**
 * Copyright(c) 2015 Jens Böttcher <eljenso.boettcher@gmail.com>
 */

$(function () {
  'use strict';
  var socket = io();

  function buildQueueTable (tracks) {
    $('#table_playlist').empty();

    for (var i = 0; i < tracks.length; i++) {
      var tableRow = document.createElement('tr');

      var songDetailsCell = document.createElement('td');
      $(songDetailsCell).text(tracks[i].artist + ' - ' + tracks[i].name);

      $(tableRow).append(songDetailsCell);
      $('#table_playlist').append(tableRow);
    };
  }


  function trackInfo(divName, track) {
    var div = document.getElementById(divName);
    $(div).empty();
    $(div).text(track.artist + ' - ' + track.name);
    if (divName === 'currentTrack') {
      $('#nextTrack').empty();
    };
  }


  socket.on('ping', function (message) {
    console.log(message);
  });


  socket.on('nextTracks', function(nextTracks) {
    buildQueueTable(nextTracks);
  });

  // Track info (current & next)
  socket.on('currentTrack', function (track) {
    trackInfo('currentTrack', track);
    console.log(track);
  });
  socket.on('nextTrack', function (track) {
    trackInfo('nextTrack', track);
    console.log(track);
  });

}()); // end strict mode
