/*
 * # Expense Tracker API
 * Exposes expense tracker data for use with the expense tracker app.
 */
'use strict';

// libs
const Hapi = require('hapi');

// config
const config = require('getconfig');

const server = new Hapi.Server();

server.connection({
  host: config.server.host,
  port: config.server.port,
  routes: {
    cors: true,
  },
});

server.route({
  method: 'GET',
  path: '/test',
  handler: (request, reply) => {
    reply({statusCode: 200, data: 'It works!'});
  }
});

server.register([
  {
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: config.hapi.log,
      }],
    },
  },
  {
    register: require('./people'),
  },
], (err) => {
  if (err) {
    throw err;
  }

  server.start(function (err) {
    if (err) {
      throw err
    }

    console.log(`server is now running at ${server.info.uri}`);
  });
});
