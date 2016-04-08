/**
 * Module dependencies
 */


/**
 * Sails.prototype.initialize()
 *
 * Start the Sails server
 * NOTE: sails.load() should be run first.
 *
 * @api private
 */

module.exports = function initialize() {

  var sails = this;

  // Indicate that server is starting
  sails.log.verbose('Starting app at ' + sails.config.appPath + '...');

  process.on('exit', function() {
    if (!sails._exiting) {
      sails.lower();
    }
  });

  // And fire the `ready` event
  // This is listened to by attached servers, etc.
  sails.emit('ready');
};
