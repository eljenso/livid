var mongoose = require('mongoose'),
    construct = require('mongoose-construct'),
    Schema = mongoose.Schema;


var QueueTrackSchema = new Schema({
  artist: String,
  name: String,
  uri: String,
  rating: Number,
  imageUri: String,
  length: Number,
  dateAdded: { type: Date, default: Date.now }
});
QueueTrackSchema.plugin(construct);


QueueTrackSchema.statics.convert = function (mopidyTrack, cb) {
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


mongoose.model('QueueTrack', QueueTrackSchema);
