/**
 * Module dependencies
 */
var nodeutil = require('util');
var nodepath = require('path');

// Build logger using best-available information
// when this module is initially required.
var log = require('captains-log')();

/**
 * Fatal Errors
 */
module.exports = {

  __InvalidConnection__: function(connection, sourceModelId) {
    log.error('In model (' + sourceModelId + '), invalid connection ::', connection);
    log.error('Must contain an `adapter` key referencing the adapter to use.');
    return _terminateProcess(1);
  },

  __UnknownConnection__: function(connectionId, sourceModelId) {
    log.error('Unknown connection, "' + connectionId + '", referenced in model `' + sourceModelId + '`.');
    log.error('Are you sure that connection exists?  It should be defined in `sails.config.connections`.');

    // var probableAdapterModuleName = connectionId.toLowerCase();
    // if ( ! probableAdapterModuleName.match(/^(sails-|waterline-)/) ) {
    // 	probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    // }
    // log.error('Otherwise, if you\'re trying to use an adapter named `' + connectionId + '`, please run ' +
    // 	'`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
    return _terminateProcess(1);
  },


  __UnknownAdapter__: function(adapterId, sourceModelId, sailsMajorV, sailsMinorV) {
    log.error('Trying to use unknown adapter, "' + adapterId + '", in model `' + sourceModelId + '`.');
    log.error('Are you sure that adapter is installed in this Sails app?');
    log.error('If you wrote a custom adapter with identity="' + adapterId + '", it should be in this app\'s adapters directory.');

    var probableAdapterModuleName = adapterId.toLowerCase();
    if (!probableAdapterModuleName.match(/^(sails-|waterline-)/)) {
      probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    }
    log.error('Otherwise, if you\'re trying to use an adapter named `' + adapterId + '`, please run ' +
      '`npm install ' + probableAdapterModuleName + '@' + sailsMajorV + '.' + sailsMinorV + '.x`');
    return _terminateProcess(1);
  },

  __InvalidAdapter__: function(attemptedModuleName, supplementalErrMsg) {
    log.error('There was an error attempting to require("' + attemptedModuleName + '")');
    log.error('Is this a valid Sails/Waterline adapter?  The following error was encountered ::');
    log.error(supplementalErrMsg);

    return _terminateProcess(1);
  }
};


/**
 * _terminateProcess
 *
 * Terminate the process as elegantly as possible.
 * If process.env is 'test', throw instead.
 *
 * @param  {[type]} code [console error code]
 * @param  {[type]} opts [currently unused]
 */
function _terminateProcess(code, opts) {
  if (process.env.NODE_ENV === 'test') {
    var Signal = new Error({
      type: 'terminate',
      code: code,
      options: {
        todo: 'put the stuff from the original errors in here'
      }
    });
    throw Signal;
  }

  return process.exit(code);
}
