var Hapi = require('hapi'),
    server = new Hapi.Server();

server.connection({ port: 3000 });

var socket = require('./modules/socketLogic.js')(server.listener);

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