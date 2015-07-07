var Hapi = require('hapi'),
    server = new Hapi.Server(),
    mongoose = require('mongoose'),
    glob = require('glob');

var config = require('./config.js');

server.connection({ port: config.main.port });

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync('./models/*.js');
models.forEach(function (model) {
  require(model);
});

mongoose.connection.collections['tracks'].drop( function(err) {
    console.log('collection dropped');
});

var socket = require('./modules/socketLogic.js');
socket.init(server.listener);

var mopidy = require('./modules/mopidyCom.js');
mopidy.init();

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


server.start(function () {
    console.log('Server running at:', server.info.uri);
});
