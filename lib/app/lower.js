/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');


/**
 * Sails.prototype.lower()
 *
 * The inverse of `lift()`, this method
 * shuts down all attached servers.
 *
 * It also unbinds listeners and terminates child processes.
 *
 * @api public
 */

module.exports = function lower(cb) {
  var sails = this;

  sails.log.verbose('Lowering sails...');

  cb = cb || function(err) {
    if (err) return sails.log.error(err);
  };

  sails._exiting = true;
  sails.emit('lower');
  cb();
};
