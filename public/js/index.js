/**
 * Copyright(c) 2015 Jens Böttcher <eljenso.boettcher@gmail.com>
 */

$(function () {
  'use strict';
  var socket = io();

  function buildQueueTable (tracks) {
    $('#tbody_playlist').empty();

    for (var i = 0; i < tracks.length; i++) {
      var tableRow = document.createElement('tr');

      var songDetailsCell = document.createElement('td');
      $(songDetailsCell).text(tracks[i].artist + ' - ' + tracks[i].name);

      var ratingCell = document.createElement('td');
      $(ratingCell).text(tracks[i].rating);

      var buttonCell = document.createElement('td');
      var voteButton = document.createElement('button');
      $(voteButton)
        .attr('id', tracks[i].uri)
        .html('<span class="glyphicon glyphicon-heart" aria-hidden="true"></span>')
        .addClass('btn btn-default btn-lg button-vote');
      $(buttonCell).append(voteButton);

      $(tableRow).append(songDetailsCell, ratingCell, buttonCell);
      $('#tbody_playlist').append(tableRow);
    };


    $('.button-vote').click(function(event) {
      $(this).blur();
      socket.emit('voteUp', $(this).attr('id'));
    });
  }

  function buildSearchResultTable (tracks) {
    $( ".searchResults" ).hide( "fast", function() {
      $('#tbody_searchResults').empty();

      tracks = tracks.splice(0,20);

      for (var i = 0; i < tracks.length; i++) {
        var tableRow = document.createElement('tr');

        var songDetailsCell = document.createElement('td');
        $(songDetailsCell).text(tracks[i].artist + ' - ' + tracks[i].name);

        var buttonCell = document.createElement('td');
        $(buttonCell).addClass('buttonCell');
        var addButton = document.createElement('button');
        $(addButton)
          .attr('id', tracks[i].uri)
          .attr('data-track', JSON.stringify(tracks[i]))
          .html('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>')
          .addClass('btn btn-default btn-lg button-add');
        $(buttonCell).append(addButton);

        $(tableRow).append(songDetailsCell, buttonCell);
        $('#tbody_searchResults').append(tableRow);

        $( ".searchResults" ).show( "fast");
      };


      $('.button-add').click(function(event) {
        $(this).blur();
        $( ".searchResults" ).hide( "fast", function() {
          $('#tbody_searchResults').empty();
        });
        $('#input_search').val('');
        addTrack(JSON.parse($(this).attr('data-track')));
      });
    });
  }


  function searchTrack (query) {
    if (!query) {
      deferred.resolve([]);
    } else {
      socket.emit('search', query);
    }
  }


  function trackInfo(divName, track) {
    var div = document.getElementById(divName);
    $(div).empty();
    $(div).text(track.artist + ' - ' + track.name);
    if (divName === 'currentTrack') {
      $('#nextTrack').empty();
    };
  }



  function arrayToHashmap(array) {
    var hashmap = {};
    for (var i = array.length - 1; i >= 0; i--) { hashmap[array[i].uri] = array[i] };
    return hashmap;
  }


  function addTrack (track) {
    if (track['$order']) { delete track['$order'] };
    socket.emit('addTrack', track);
  };

  function executeSearch ($object) {
    $($object).blur();
    var query = $('#input_search').val();

    searchTrack(query);
  }

  $('#input_search').keypress(function (e) {
    if (e.which == 13) {
      executeSearch(this);
      return false;
    }
  });
  $('#button_search').click(function(event) {
    executeSearch(this);
  });

  $('#button_clearSearch').click(function(event) {
    $( ".searchResults" ).hide( "fast", function() {
      $('#tbody_searchResults').empty();
      $('#input_search').val('');
    });
  });


  socket.on('searchResult', function (results) {
    buildSearchResultTable(results);
  });

  socket.on('nextTracks', function(nextTracks) {
    buildQueueTable(nextTracks);
  });

  // Track info (current & next)
  socket.on('currentTrack', function (track) {
    trackInfo('currentTrack', track);
  });
  socket.on('nextTrack', function (track) {
    trackInfo('nextTrack', track);
  });

}()); // end strict mode
