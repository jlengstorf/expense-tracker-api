/*
 * # people.js
 * Sets up API endpoints for managing the `people` collection.
 */
'use strict';

/*
 * ## Dependencies
 */
const config = require('getconfig');
const MongoClient = require('mongodb').MongoClient;

/*
 * ## Export the Routes
 */
module.exports.register = (server, options, next) => {

  /*
   * All of these require database access, so we wrap all the route
   * declarations in Mongo's `connect` call.
   */
  MongoClient.connect(config.mongodb.uri, (err, db) => {
    if (err) {
      next(err);
    }

    /*
     * ## Store a New Person
     * Using PUT, stores a new person in the collection.
     *
     * NOTE: The `email` field needs to be a unique index for this to work
     * without creating duplicate emails.
     */
    server.route({
      method: 'PUT',
      path: '/people',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('people');

          // Inserts or updates (by user ID or email) the collection
          collection.update(
            {
              $or: [
                {id: request.payload.id},
                {email: request.payload.email},
              ],
            },
            JSON.parse(request.payload),
            {upsert: true},
            (err, resp) => {
              if (err) {
                console.log(err);
              }

              reply(err || resp);
            }
          );
        },
      },
    });

    // TODO Remove this
    server.route({
      method: 'GET',
      path: '/people/drop',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('people');

          reply(collection.drop());
        },
      },
    });

    // TODO Remove this
    server.route({
      method: 'GET',
      path: '/people/all',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('people');

          collection
            .find({})
            .toArray((err, docs) => {
              if (err) {
                console.log(err);
              }

              reply(err || docs);
            });
        },
      },
    });

    /*
     * ## Retrieve a Person by Email
     * TODO Make this support at least the ID field
     */
    server.route({
      method: 'GET',
      path: '/people',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('people');

          console.log('GET request');
          console.log(request.query.email);

          if (request.query.email) {
            collection
              .find({ email: request.query.email })
              .toArray((err, docs) => {
                if (err) {
                  console.log(err);
                }

                reply(err || docs);
              });
          } else {
            reply({error: 'no query string'});
          }
        },
      },
    });

    console.log('people store access registered');
    next();
  });
};

module.exports.register.attributes = {
  name: 'people',
  version: '0.0.1',
};
