/**
 * Module dependencies.
 */

var util = require('sails-util'),
  uuid = require('node-uuid'),
  path = require('path'),
  generateSecret = require('./generateSecret'),
  cookie = require('express/node_modules/cookie'),
  parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie,
  ConnectSession = require('express/node_modules/connect').middleware.session.Session;


module.exports = function(sails) {


  // Session hook
  var Session = {


    defaults: {
      session: {
        adapter: 'memory',
        key: "sails.sid"
      }
    },

    /**
     * Normalize and validate configuration for this hook.
     * Then fold any modifications back into `sails.config`
     */
    configure: function() {

      // Validate config
      // Ensure that secret is specified if a custom session store is used
      if (sails.config.session) {
        if (!util.isObject(sails.config.session)) {
          throw new Error('Invalid custom session store configuration!\n' +
            '\n' +
            'Basic usage ::\n' +
            '{ session: { adapter: "memory", secret: "someVerySecureString", /* ...if applicable: host, port, etc... */ } }' +
            '\n\nCustom usage ::\n' +
            '{ session: { store: { /* some custom connect session store instance */ }, secret: "someVerySecureString", /* ...custom settings.... */ } }'
          );
        }

      }

      // If session config is set, but secret is undefined, set a secure, one-time use secret
      if (!sails.config.session || !sails.config.session.secret) {

        sails.log.verbose('Session secret not defined-- automatically generating one for now...');

        if (sails.config.environment === 'production') {
          sails.log.warn('Session secret must be identified!');
          sails.log.warn('Automatically generating one for now...');

          sails.log.error('This generated session secret is NOT OK for production!');
          sails.log.error('It will change each time the server starts and break multi-instance deployments.');
          sails.log.blank();
          sails.log.error('To set up a session secret, add or update it in `config/session.js`:');
          sails.log.error('module.exports.session = { secret: "keyboardcat" }');
          sails.log.blank();
        }

        sails.config.session.secret = generateSecret();
      }

      // Backwards-compatibility / shorthand notation
      // (allow mongo or redis session stores to be specified directly)
      if (sails.config.session.adapter === 'redis') {
        sails.config.session.adapter = 'connect-redis';
      }
      else if (sails.config.session.adapter === 'mongo') {
        sails.config.session.adapter = 'connect-mongo';
      }
    },

    /**
     * Create a connection to the configured session store
     * and keep it around
     *
     * @api private
     */
    initialize: function(cb) {
      var sessionConfig = sails.config.session;

      // Intepret session adapter config and "new up" a session store
      if (util.isObject(sessionConfig) && !util.isObject(sessionConfig.store)) {

        // Unless the session is explicitly disabled, require the appropriate adapter
        if (sessionConfig.adapter) {

          // 'memory' is a special case
          if (sessionConfig.adapter === 'memory') {
            var MemoryStore = require('express').session.MemoryStore;
            sessionConfig.store = new MemoryStore();
          }
          // Try and load the specified adapter from the local sails project,
          // or catch and return error:
          else {

            var COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR = function (adapter, packagejson, e) {
              var errMsg;
              if (e && typeof e === 'object' && e instanceof Error) {
                errMsg = e.stack;
              }
              else {
                errMsg = util.inspect(e);
              }

              var output = 'Could not load Connect session adapter :: ' + adapter + '\n';
              if (packagejson && !packagejson.main) {
                output+='(If this is your module, make sure that the module has a "main" configuration in its package.json file)';
              }
              output+='\nError from adapter:\n'+ errMsg+'\n\n';


              // Recommend installation of the session adapter:
              output += 'Do you have the Connect session adapter installed in this project?\n';
              output += 'Try running the following command in your project\'s root directory:\n';
              var installRecommendation = 'npm install ';
              if (adapter === 'connect-redis') {
                installRecommendation += 'connect-redis@1.4.5';
                installRecommendation += '\n(Note that `connect-redis@1.5.0` introduced breaking changes- make sure you have v1.4.5 installed!)';
              }
              else {
                installRecommendation += adapter;
                installRecommendation +='\n(Note: Make sure the version of the Connet adapter you install is compatible with Express 3/Sails v0.10)';
              }
              installRecommendation += '\n';

              output += installRecommendation;

              return output;
            };

            try {

              // Determine the path to the adapter by using the "main" described in its package.json file:
              var pathToAdapterDependency;
              var pathToAdapterPackage = path.resolve(sails.config.appPath, 'node_modules', sessionConfig.adapter ,'package.json');
              var adapterPackage;
              try {
                adapterPackage = require(pathToAdapterPackage);
                pathToAdapterDependency = path.resolve(sails.config.appPath, 'node_modules', sessionConfig.adapter, adapterPackage.main);
              }
              catch (e) {
                return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, adapterPackage, e));
              }
              var SessionAdapter = require(pathToAdapterDependency);
              var CustomStore = SessionAdapter(require('express'));
              sessionConfig.store = new CustomStore(sessionConfig);
            } catch (e) {
              // TODO: negotiate error
              return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, adapterPackage, e));
            }
          }
        }
      }

      // Save reference in `sails.session`
      sails.session = Session;

      return cb();
    },



    /**
     * Create a new sid and build an empty session for it.
     *
     * @param {Object} handshake - a socket "handshake" -- basically, this is like `req`
     * @param {Function} cb
     * @returns live session, with `id` property === new sid
     */
    generate: function(handshake, cb) {

      // Generate a session object w/ sid
      // This is important since we need this sort of object as the basis for the data
      // we'll save directly into the session store.
      // (handshake is a pretend `req` object, and 2nd argument is cookie config)
      var session = new ConnectSession(handshake, {
        cookie: {
          // Prevent access from client-side javascript
          httpOnly: true,

          // Restrict to path
          path: '/'
        }
      });

      // Next, persist the new session
      Session.set(session.id, session, function(err) {
        if (err) return cb(err);
        sails.log.verbose('Generated new session (', session.id, ') for socket....');

        // Pass back final session object
        return cb(null, session);
      });

    },


    /**
     * @param {String} sessionId
     * @param {Function} cb
     *
     * @api private
     */
    get: function(sessionId, cb) {
      if (!util.isFunction(cb)) {
        throw new Error('Invalid usage :: `Session.get(sessionId, cb)`');
      }
      return sails.config.session.store.get(sessionId, cb);
    },

    /**
     * @param {String} sessionId
     * @param {} data
     * @param {Function} [cb] - optional
     *
     * @api private
     */
    set: function(sessionId, data, cb) {
      cb = util.optional(cb);
      return sails.config.session.store.set(sessionId, data, cb);
    },

  };


  return Session;
};
