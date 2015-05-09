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

      tracks = tracks.splice(0,10);

      for (var i = 0; i < tracks.length; i++) {
        // var track = convert(tracks[i]);

        var tableRow = document.createElement('tr');

        var songDetailsCell = document.createElement('td');
        $(songDetailsCell).text(tracks[i].artist + ' - ' + tracks[i].name);

        var songPictureCell = document.createElement('td');
        var songPicture = document.createElement('img');
        $(songPicture).attr('src', tracks[i].imageUri);
        $(songPictureCell).append(songPicture);

        var buttonCell = document.createElement('td');
        var voteButton = document.createElement('button');
        $(voteButton)
          .attr('id', tracks[i].uri)
          .html('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>')
          .addClass('btn btn-default btn-lg button-add');
        $(buttonCell).append(voteButton);

        $(tableRow).append(songPicture, songDetailsCell, buttonCell);
        $('#tbody_searchResults').append(tableRow);

        $( ".searchResults" ).show( "fast");
      };


      $('.button-add').click(function(event) {
        $(this).blur();
        $( ".searchResults" ).hide( "fast", function() {
          $('#tbody_searchResults').empty();
        });
        $('#input_search').val('');
        addTrack(currentSearchResult[$(this).attr('id')]);
      });
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

    if (!query) {
      deferred.resolve([]);
    } else {
      $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'track',
            market: 'DE'
        },
        success: function (response) {
          var foundTracks = response.tracks.items;
          for (var i = 0; i < foundTracks.length; i++) {
            foundTracks[i] = convert(foundTracks[i]);
          };
          deferred.resolve(foundTracks);
        }
      });
    }

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



  function arrayToHashmap(array) {
    var hashmap = {};
    for (var i = array.length - 1; i >= 0; i--) { hashmap[array[i].uri] = array[i] };
    return hashmap;
  }


  function addTrack (track) {
    if (track['$order']) { delete track['$order'] };
    socket.emit('addTrack', track);
  };


  var currentSearchResult = {};
  function executeSearch ($object) {
    $($object).blur();
    var query = $('#input_search').val();

    searchTrack(query)
      .then(function (tracks) {
        currentSearchResult = arrayToHashmap(tracks);
        return buildSearchResultTable(tracks);
      });
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

  /*
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
  */


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
