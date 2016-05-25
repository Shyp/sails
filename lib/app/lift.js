/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');


/**
 * Sails.prototype.lift()
 *
 * Loads the app, then starts all attached servers.
 *
 * @api public
 */

module.exports = function lift(configOverride, cb) {
  var sails = this;

  // try {console.timeEnd('require_core');}catch(e){}

  // try {console.time('core_lift');}catch(e){}

  // Callback is optional
  cb = cb || function(err) {
    if (err) return sails.log.error(err);
  };

  sails.load(configOverride, function(err) {
    if (err) {
      sails.lower(function (errorLoweringSails) {

        cb(err);

        if (errorLoweringSails) {
          sails.log.error('When trying to lower the app as a result of a failed lift, encountered an error:',errorLoweringSails);
        }
      });
    }

    sails.initialize();

    sails.emit('lifted');
    sails.isLifted = true;
    return cb(null, sails);
  });
};
