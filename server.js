var Hapi = require('hapi'),
    server = new Hapi.Server();

var config = require('./config.js');

server.connection({ port: config.main.port });

var socket = require('./modules/socketLogic.js')(server.listener);
var mopidy = require('./modules/mopidyCom.js')();

server.views({
  engines: {
    jade: require('jade')
  },
  relativeTo: __dirname,
  path: 'views',
  context: {
    website: 'Party Mate'
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