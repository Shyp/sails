/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');


/**
 * exposeGlobals()
 *
 * Expose certain global variables
 * (if config says so)
 *
 * @api private
 */

module.exports = function exposeGlobals() {
  var sails = this;

  sails.log.verbose('Exposing global variables... (you can disable this by modifying the properties in `sails.config.globals`)');

  // Globals explicitly disabled
  if (sails.config.globals === false) {
    return;
  }

  sails.config.globals = sails.config.globals || {};

  if (sails.config.globals.sails !== false) {
    global['sails'] = sails;
  }

  // `orm` hook takes care of globalizing models and adapters (if enabled)

};
