var Hapi = require('hapi'),
    server = new Hapi.Server(),
    nedb = require('nedb'),
    glob = require('glob');

// Load configfile
var config = require('./config.js');


// Load database
var db = {};
db.queue = new nedb({ filename: config.db.queuePath, autoload: true });
db.history = new nedb({ filename: config.db.historyPath, autoload: true });



// var models = glob.sync('./models/*.js');
// models.forEach(function (model) {
//   require(model);
// });

// if (process.env.ENV !== 'prod') {
//   mongoose.connection.collections['queuetracks'].drop( function(err) {
//       console.log('old queue tracks dropped');
//   });
// }

/*
var socket = require('./modules/socketLogic.js');
socket.init(server.listener);

var mopidy = require('./modules/mopidyCom.js');
mopidy.init();
*/

server.views({
  engines: {
    jade: require('jade')
  },
  relativeTo: __dirname,
  path: 'views',
  context: {
    website: 'Livid'
  }
});


server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index', {
          title: 'Index'
        })
    }
});


server.route({
    method: 'GET',
    path: '/history',
    handler: function (request, reply) {
        reply.view('history', {
          title: 'History'
        })
    }
});

// Static files
server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});


// Configure hapi server
server.connection({ port: config.main.port });

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
