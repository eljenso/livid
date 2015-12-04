var nedb = require('nedb'),
    Q = require('q');

// Load configfile
var config = require('../config.js');

// Load database
var db = {};
db.queue = new nedb({ filename: config.db.queuePath, autoload: true, timestampData: true });
db.history = new nedb({ filename: config.db.historyPath, autoload: true, timestampData: true });

db.queue.ensureIndex({fieldName: 'uri', unique: true}, function (err) {
  if (err) throw err;
});
db.history.ensureIndex({fieldName: 'uri', unique: true}, function (err) {
  if (err) throw err;
});


function getTracks(uri, dbName, limit) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';
  if (typeof limit === 'undefined') limit = 10;

  db[dbName].find({ uri: uri }).sort({ createdAt: -1 }).limit(limit).exec(function (err, tracks) {
    if (err) deferred.reject(err);
    deferred.resolve(tracks);
  });

  return deferred.promise;
};


function getTrack(uri, dbName) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';

  db[dbName].findOne({ uri: uri }).exec(function (err, track) {
    if (err) deferred.reject(err);
    deferred.resolve(track);
  });

  return deferred.promise;
};


function getNextTracks(dbName, limit) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';
  if (typeof limit === 'undefined') limit = 10;

  db[dbName].find({}).sort({ rating: -1 }).limit(limit).exec(function (err, tracks) {
    if (err) deferred.reject(err);
    deferred.resolve(tracks);
  });

  return deferred.promise;
}


function saveTrack(track, dbName) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';

  db[dbName].insert(track, function (err, savedTrack) {
    if (err) console.log(err);
    deferred.resolve(savedTrack);
  });
  return deferred.promise;
};


function deleteTrack(uri, dbName) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';

  db[dbName].remove({ uri: uri }, function (err) {
    if (err) deferred.reject(err);
    deferred.resolve();
  });

  return deferred.promise;
};


function voteUp(uri, dbName) {
  var deferred = Q.defer();

  if (typeof dbName === 'undefined') dbName = 'queue';

  db[dbName].update({ uri: uri }, {$inc: {rating: 1} }, function (err, track) {
    if (err) deferred.reject(err);
    deferred.resolve(track);
  });

  return deferred.promise;
};


exports.getTrack = getTrack;
exports.saveTrack = saveTrack;
exports.deleteTrack = deleteTrack;
exports.getTracks = getTracks;
exports.voteUp = voteUp;
exports.getNextTracks = getNextTracks;
