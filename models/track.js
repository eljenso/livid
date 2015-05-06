var mongoose = require('mongoose'),
    construct = require('mongoose-construct'),
    Schema = mongoose.Schema;


var TrackSchema = new Schema({
  artist: String,
  name: String,
  uri: String,
  rating: Number,
  imageUri: String,
  length: Number
});
TrackSchema.plugin(construct);


TrackSchema.statics.convert = function (mopidyTrack, cb) {
  var trackSchema = {
    artist: mopidyTrack.artists[0].name,
    name: mopidyTrack.name,
    uri: mopidyTrack.uri,
    rating: 0,
    imageUri: '',
    length: mopidyTrack.length
  };

  if (mopidyTrack.artists.length > 1) {
    for (var i = 1; i < mopidyTrack.artists.length; i++) {
      trackSchema.arist += ', ' + mopidyTrack.artists[i].name;
    };
  };

  cb(trackSchema);
};


mongoose.model('Track', TrackSchema);
