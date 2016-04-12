/**
 * Module dependencies.
 */

var path = require('path');

var cookieParser = require('cookie-parser');
var express = require('express');
var _ = require('lodash');


module.exports = function(sails) {


  var initialize = require('./initialize')(sails);

  /**
   * Expose `http` hook definition
   */

  return {


    defaults: function(config) {
      return {

        // Self-awareness: the host the server *thinks it is*
        // host: 'localhost',

        // Port to run this app on
        port: 6789,

        // Users' SSL cert settings end up here
        ssl: {},

        // HTTP cache configuration
        cache: {
          maxAge: config.environment === 'development' ? 1 : 31557600000
        },

        // Path static files will be served from
        // Uses `path.resolve()` to accept either:
        //  • an absolute path
        //  • a relative path from the app root (sails.config.appPath)
        paths: {
          public: '.tmp/public'
        },


        // New http-only middleware config
        // (provides default middleware)
        http: {
          middleware: {
            order: [
              'startRequestTimer',
              'cookieParser',
              'compress',
              '$custom',
              'router',
              'www',
              '404',
              '500'
            ],

            // Default middleware definitions are injected
            // after the `app` object is available.
            // (see `loadMiddleware.js` and `middleware.js`)
            // e.g.:
            // session: {
            //   options: {},
            //   fn: function (req, res, next) { ... }
            // }

          },


          // Extra options to pass directly into the Express server
          // when it is instantiated
          //      (or false to disable)
          //
          // This is the options object for the `createServer` method, as discussed here:
          // http://nodejs.org/docs/v0.10.20/api/https.html#https_class_https_server
          serverOptions: undefined,


          // Custom express middleware function to use
          customMiddleware: undefined,

          // Cookie parser middleware to use
          // XXX remove this
          cookieParser: cookieParser,
        }
      };
    },


    configure: function() {

      // If one piece of the ssl config is specified, ensure the other required piece is there
      if (sails.config.ssl && (
        sails.config.ssl.cert && !sails.config.ssl.key
      ) || (!sails.config.ssl.cert && sails.config.ssl.key)) {
        throw new Error('Invalid SSL config object!  Must include cert and key!');
      }

      if (sails.config.host) {
        sails.config.explicitHost = sails.config.host;
      }

      if (sails.config.express) {
        sails.log.warn('`sails.config.express` is deprecated; use `sails.config.http` instead.');
      }


      // Path static files will be served from
      //
      // Uses `path.resolve()` to accept either:
      //  • an absolute path
      //  • a relative path from the app root (sails.config.appPath)
      sails.config.paths.public = path.resolve(sails.config.appPath, sails.config.paths.public);

      // Merge in legacy `sails.config.express` object for backwards-compat.
      sails.util.defaultsDeep(sails.config.http, sails.config.express||{});

      // If no custom middleware order is specified, make sure the default one is used.
      // This lets you override default middleware without having to explicitly include the
      // "order" array in your http.js config file.
      sails.config.http.middleware.order = sails.config.http.middleware.order || sails.hooks.http.defaults(sails.config).http.middleware.order;

    },


    /**
     * Initialize is fired first thing when the hook is loaded
     * but after waiting for user config (if applicable)
     *
     * @api public
     */

    initialize: function(cb) {
      // Don't use the cookieParser or session middleware
      _.remove(sails.config.http.middleware.order, function (mwr){
        return mwr === 'session' || mwr === 'cookieParser';
      });

      return initialize(cb);
    }
  };
};
