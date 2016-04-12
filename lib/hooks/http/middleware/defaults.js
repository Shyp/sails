/**
 * Module dependencies
 */

var compression = require('compression');
var _ = require('lodash');

module.exports = function(sails, app) {

  //
  // !!! IMPORTANT !!!
  // `require('express')` is in here on purpose.
  // (i.e. if we `require` this above w/ everything else,
  // the NODE_ENV might not be set properly yet, and express
  // might think it's in a different env than it actually is)
  var express = require('express');
  var IS_PRODUCTION = process.env.NODE_ENV === 'production';

  return _.defaults(sails.config.http.middleware || {}, {

    // Configure flat file server to serve static files
    // (By default, all explicit+shadow routes take precedence over flat files)
    www: (function() {
      var flatFileMiddleware = express['static'](sails.config.paths['public'], {
        maxAge: sails.config.cache.maxAge
      });

      // Make some MIME type exceptions for Google fonts
      express['static'].mime.define({
        'application/font-woff': ['woff']
      });

      return flatFileMiddleware;
    })(),

    /**
     * Track request start time as soon as possible
     *
     * TODO: consider including connect.logger by default
     * (https://github.com/senchalabs/connect/blob/master/lib/middleware/logger.js)
     */
    startRequestTimer: !IS_PRODUCTION && function startRequestTimer(req, res, next) {
      req._startTime = new Date();
      next();
    },

    cookieParser: (function() {
      // backwards compatibility for old express.cookieParser config
      var cookieParser =
        sails.config.http.cookieParser || sails.config.http.middleware.cookieParser;

      // If session config does not exist, don't throw an error, just set to undefined.
      return cookieParser && cookieParser(false);
    })(),

    compress: IS_PRODUCTION && compression(),

  });
};
