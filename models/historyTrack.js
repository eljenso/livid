var mongoose = require('mongoose'),
    construct = require('mongoose-construct'),
    Schema = mongoose.Schema;


var HistoryTrackSchema = new Schema({
  artist: String,
  name: String,
  uri: String,
  rating: Number,
  imageUri: String,
  timePlayed: { type: Date, default: Date.now }
});
HistoryTrackSchema.plugin(construct);


HistoryTrackSchema.statics.convert = function (queueTrack, cb) {
  var historyTrackSchema = {
    artist: queueTrack.artist,
    name: queueTrack.name,
    uri: queueTrack.uri,
    rating: queueTrack.rating,
    imageUri: queueTrack.imageUri
  };

  cb(historyTrackSchema);
};


mongoose.model('HistoryTrack', HistoryTrackSchema);
