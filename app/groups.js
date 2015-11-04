/*
 * # groups.js
 * Sets up API endpoints for managing the `groups` collection.
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
     * ## Store a New Group
     * Using PUT, stores a new group in the collection.
     *
     * NOTE: The `owner` field needs to be a unique index for this to work
     * without creating duplicate records.
     */
    server.route({
      method: 'PUT',
      path: '/groups',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('groups');

          // Inserts or updates (by user ID or owner) the collection
          collection.update(
            {
              $or: [
                {id: request.payload.id},
                {owner: request.payload.owner},
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
      path: '/groups/drop',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('groups');

          reply(collection.drop());
        },
      },
    });

    // TODO Remove this
    server.route({
      method: 'GET',
      path: '/groups/all',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('groups');

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
      path: '/groups',
      config: {
        handler: (request, reply) => {
          const collection = db.collection('groups');

          console.log('GET request');
          console.log(request.query.owner);

          if (request.query.owner) {
            collection
              .find({ owner: request.query.owner })
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

    console.log('groups store access registered');
    next();
  });
};

module.exports.register.attributes = {
  name: 'groups',
  version: '0.0.1',
};
