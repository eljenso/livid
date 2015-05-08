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

      var buttonCell = document.createElement('td');
      var voteButton = document.createElement('button');
      $(voteButton)
        .attr('id', tracks[i].uri)
        .html('<span class="glyphicon glyphicon-heart" aria-hidden="true"></span>')
        .addClass('btn btn-default btn-lg button-vote');
      $(buttonCell).append(voteButton);

      $(tableRow).append(songDetailsCell, buttonCell);
      $('#table_playlist').append(tableRow);
    };


    $('.button-vote').click(function(event) {
      $(this).blur();
      socket.emit('voteUp', $(this).attr('id'));
    });
  }


  function convert (mopidyTrack) {
    var trackSchema = {
      artist: mopidyTrack.artists[0].name,
      name: mopidyTrack.name,
      uri: mopidyTrack.uri,
      rating: 1,
      imageUri: '',
      length: mopidyTrack.duration_ms
    };

    if (mopidyTrack.album && mopidyTrack.album.images[2] && mopidyTrack.album.images[2].url) {
      trackSchema.imageUri = mopidyTrack.album.images[2].url;
    };

    if (mopidyTrack.artists.length > 1) {
      for (var i = 1; i < mopidyTrack.artists.length; i++) {
        trackSchema.artist += ', ' + mopidyTrack.artists[i].name;
      };
    };

    return trackSchema;
  };

  function searchTrack (query) {
    var deferred = $.Deferred();

    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {
          q: query,
          type: 'track',
          market: 'DE'
      },
      success: function (response) {
        deferred.resolve(response.tracks.items);
      }
    });

    return deferred.promise();
  }


  function trackInfo(divName, track) {
    var div = document.getElementById(divName);
    $(div).empty();
    $(div).text(track.artist + ' - ' + track.name);
    if (divName === 'currentTrack') {
      $('#nextTrack').empty();
    };
  }



  function arrayToHashmap(hashmap, array) {
    for (var i = array.length - 1; i >= 0; i--) { hashmap[array[i].uri] = array[i] };
  }


  function addTrack (track) {
    if (track['$order']) { delete track['$order'] };
    socket.emit('addTrack', track);
  };


  var currentSearchResult = {};
  var selectize_track = $('#input_search').selectize({
    valueField: 'uri',
    labelField: 'name',
    items: ['name', 'artist', 'uri'],
    searchField: ['name', 'artist'],
    highlight: false,
    create: false,
    closeAfterSelect: true,
    loadThrottle: 400,
    render: {
        option: function(item, escape) {
            return '<div>' +
                '<img src="' + escape(item.imageUri) + '" alt="">' +
                '<span class="title">' +
                    '<span class="name">' + escape(item.artist) + ' - ' + escape(item.name) + '</span>' +
                '</span>' +
            '</div>';
        }
    },
    load: function(query, callback) {
      if (!query.length) return callback();

      var result = [];
      searchTrack(query)
        .then(function (tracks) {
          for (var i = 0; i < tracks.length; i++) {
            result.push(convert(tracks[i]));
          };
        })
        .then(function () {
          arrayToHashmap(currentSearchResult, result);
          callback(result);
        })
    },
    onItemAdd: function (value, item) {
      addTrack(currentSearchResult[value]);
    },
    onDropdownClose: function (dropdown) {
      currentSearchResult = {};
      
      // Reset selectize
      this.clear(true);
      this.clearOptions();
    }
  });
  selectize_track = selectize_track[0].selectize;



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
