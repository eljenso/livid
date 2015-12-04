var Q = require('q');

function Track(artist, name, uri, rating, imageUri, length) {
  this.artist = artist,
  this.name = name,
  this.uri = uri,
  this.rating = rating,
  this.imageUri = imageUri,
  this.length = length || 0
}

/*
Track.prototype.convert = function (queueTrack, cb) {
  var historyTrack = new Track(
    queueTrack.artist,
    queueTrack.name,
    queueTrack.uri,
    queueTrack.rating,
    queueTrack.imageUri
  );

  cb(historyTrack);
};

Track.prototype.convert1 = function (mopidyTrack, cb) {
  var queueTrack = new Track(
    mopidyTrack.artist,
    mopidyTrack.name,
    mopidyTrack.uri,
    mopidyTrack.rating,
    mopidyTrack.imageUri,
    mopidyTrack.length
  );

  var queueTrackSchema = {
    artist: mopidyTrack.artists[0].name,
    name: mopidyTrack.name,
    uri: mopidyTrack.uri,
    rating: 0,
    imageUri: '',
    length: mopidyTrack.length
  };

  if (mopidyTrack.artists.length > 1) {
    for (var i = 1; i < mopidyTrack.artists.length; i++) {
      queueTrackSchema.artist += ', ' + mopidyTrack.artists[i].name;
    };
  };

  cb(queueTrackSchema);
};
*/


exports.Track = Track;
