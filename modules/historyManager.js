var Q = require('q');

function addToHistory(trackUri) {
	var deferred = Q.defer();

	// QueueTrack.findOne({ 'uri': trackUri }, function (err, track) {
  //   if (err) return console.error(err);
	// 	HistoryTrack.convert(track, function(convertedTrack) {
	// 		var historyTrack = new HistoryTrack(convertedTrack);
	//
	// 		historyTrack.save(function (err, savedTrack) {
  //       if (err) return console.error(err);
	// 			deferred.resolve();
  //     });
	// 	})
	//
  // });
	deferred.resolve();

	return deferred.promise;
}

exports.addToHistory = addToHistory;
