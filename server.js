var Hapi = require('hapi'),
    server = new Hapi.Server(),
    glob = require('glob');

// Load configfile
var config = require('./config.js');



var mopidy = require('./modules/mopidyCom.js');
mopidy.init();

// Configure hapi server
server.connection({ port: config.main.port });

var socket;
server.register(require('hapio'), function(err) {
  if (err) throw err;
  socket = require('./modules/socketLogic.js');
  socket.init(server.plugins.hapio.io);
});


// View engine
server.register(require('vision'), function (err) {
  if (err) {
    throw err;
  }

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
});

// Static files
server.register(require('inert'), function (err) {

  if (err) {
    throw err;
  }

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
});


/*
 * Set routes
 */
// root
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index', {
          title: 'Index'
        })
    }
});

// History page
server.route({
    method: 'GET',
    path: '/history',
    handler: function (request, reply) {
        reply.view('history', {
          title: 'History'
        })
    }
});


server.start(function () {
    console.log('Server running at:', server.info.uri);
});
