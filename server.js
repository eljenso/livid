var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 3000 });

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


server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});


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