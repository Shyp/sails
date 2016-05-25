/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var loadSails = require('./load');
var mixinAfter = require('./private/after');
var CaptainsLog = require('captains-log');



/**
 * Construct a Sails (app) instance.
 *
 * @constructor
 */

function Sails() {

  // Inherit methods from EventEmitter
  events.EventEmitter.call(this);

  // Remove memory-leak warning about max listeners
  // See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
  this.setMaxListeners(0);

  // Keep track of spawned child processes
  this.childProcesses = [];

  // Ensure CaptainsLog exists
  this.log = CaptainsLog();

  // Mixin `load()` method to load the pieces
  // of a Sails app
  this.load = loadSails(this);

  // Mixin support for `Sails.prototype.after()`
  mixinAfter(this);

  // Bind `this` context for all `Sails.prototype.*` methods
  this.load = _.bind(this.load, this);
  this.lift = _.bind(this.lift, this);
  this.lower = _.bind(this.lower, this);
  this.initialize = _.bind(this.initialize, this);
  this.exposeGlobals = _.bind(this.exposeGlobals, this);
  this.isLocalSailsValid = _.bind(this.isLocalSailsValid, this);
  this.isSailsAppSync = _.bind(this.isSailsAppSync, this);
  this.toString = _.bind(this.toString, this);
  this.toJSON = _.bind(this.toJSON, this);
}


// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Sails, events.EventEmitter);


// Public methods
////////////////////////////////////////////////////////

Sails.prototype.lift = require('./lift');

Sails.prototype.lower = require('./lower');


// Private methods:
////////////////////////////////////////////////////////

Sails.prototype.initialize = require('./private/initialize');
Sails.prototype.exposeGlobals = require('./private/exposeGlobals');
Sails.prototype.isLocalSailsValid = require('./private/isLocalSailsValid');
Sails.prototype.isSailsAppSync = require('./private/isSailsAppSync');

// Presentation
Sails.prototype.toString = require('./private/toString');
Sails.prototype.toJSON = require('./private/toJSON');

// Utilities
// Includes lodash, node's `util`, and a few additional
// static helper methods.
// (may be deprecated in a future release)
Sails.prototype.util = require('sails-util');

// Expose Sails constructor
module.exports = Sails;
