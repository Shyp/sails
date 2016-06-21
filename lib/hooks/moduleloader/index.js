module.exports = function(sails) {


  /**
   * Module dependencies
   */

  var path = require('path');
  var async = require('async');
  var _ = require('lodash');
  var buildDictionary = require('sails-build-dictionary');


  /**
   * Module loader
   *
   * Load a module into memory
   */
  return {


    // Default configuration
    defaults: function (config) {

      // TODO:
      // lazy-load (i.e. only do this if a `.coffee` file is encountered), e.g.
      // if (filepath.match(/\.coffee$/)) {}

      // TODO:
      // negotiate the error-- if it's NOT a require error, log it directly.
      // if it IS, display the error we have currently
      // (the only reason it's verbose right now is that if you're NOT using coffeescript
      //  it's pretty annoying to see the error pop up every time-- see previous todo)

      // Enable server-side CoffeeScript support
      try {
        require('coffee-script/register');
      } catch(e0){
        try {
          var appPath = config.appPath || process.cwd();
          require(path.join(appPath, 'node_modules/coffee-script/register'));
        }
        catch (e1) {
          sails.log.verbose('Please run `npm install coffee-script` to use coffescript (skipping for now)');
          sails.log.silly('Here\'s the require error(s): ',e0,e1);
        }
      }

      return {

        // The path to the application
        appPath: config.appPath ? path.resolve(config.appPath) : process.cwd(),

        // Paths for application modules and key files
        // If `paths.app` not specified, use process.cwd()
        // (the directory where this Sails process is being initiated from)
        paths: {

          // Configuration
          //
          // For `userconfig` hook
          config: path.resolve(config.appPath, 'config'),

          // Server-Side Code
          //
          // For `orm` hook
          adapters: path.resolve(config.appPath, 'api/adapters'),
          models: path.resolve(config.appPath, 'api/models'),
        }
      };
    },


    initialize: function(cb) {

      // Expose self as `sails.modules` (for backwards compatibility)
      sails.modules = sails.hooks.moduleloader;

      return cb();
    },

    configure: function() {
      if (sails.config.moduleLoaderOverride) {
        var override = sails.config.moduleLoaderOverride(sails, this);
        sails.util.extend(this, override);
        if (override.configure) {
          this.configure();
        }
      }
      // console.log('Trying to use appPath:',sails.config.appPath);
      // console.log('Trying to use config dir at:',path.resolve(sails.config.appPath, 'config'));
      sails.config.appPath = sails.config.appPath ? path.resolve(sails.config.appPath) : process.cwd();

      _.extend(sails.config.paths, {

        // Configuration
        //
        // For `userconfig` hook
        config: path.resolve(sails.config.appPath, sails.config.paths.config),

        // Server-Side Code
        //
        // For `orm` hook
        adapters: path.resolve(sails.config.appPath, sails.config.paths.adapters),
        models: path.resolve(sails.config.appPath, sails.config.paths.models)
      });
    },

    /**
     * Load user config from app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserConfig: function (cb) {

      async.auto({

        'config/*': function loadOtherConfigFiles (cb) {
          // console.log('TRYING T LOAD CONFIG AT:',sails.config.paths.config);
          buildDictionary.aggregate({
            dirname   : sails.config.paths.config || sails.config.appPath + '/config',
            exclude   : ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
            excludeDirs: /(locales|env)$/,
            filter    : /(.+)\.(js|json|coffee|litcoffee)$/,
            identity  : false
          }, cb);
        },


        'config/local' : function loadLocalOverrideFile (cb) {
          buildDictionary.aggregate({
            dirname   : sails.config.paths.config || sails.config.appPath + '/config',
            filter    : /local\.(js|json|coffee|litcoffee)$/,
            identity  : false
          }, cb);
        },


        'config/env/*' : ['config/local', function loadLocalOverrideFile (cb, async_data) {
          // If there's an environment already set in sails.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = sails.config.environment || async_data['config/local'].environment || 'development';
          buildDictionary.aggregate({
            dirname   : (sails.config.paths.config || sails.config.appPath + '/config') + '/env',
            filter    : new RegExp(env + '.(js|json|coffee|litcoffee)$'),
            optional  : true,
            identity  : false
          }, cb);
        }]

      }, function (err, async_data) {
        if (err) return cb(err);
        // Save the environment override, if any.
        var env = sails.config.environment;
        // Merge the configs, with env/*.js files taking precedence over others, and local.js
        // taking precedence over everything
        var config = sails.util.merge(
          async_data['config/*'],
          async_data['config/env/*'],
          async_data['config/local']
        );
        // Set the environment, but don't allow env/* files to change it; that'd be weird.
        config.environment = env || async_data['config/local'].environment || 'development';
        // Return the user config
        cb(null, config);
      });
    },




    /**
     * Load adapters
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadAdapters: function (cb) {
      buildDictionary.optional({
        dirname   : sails.config.paths.adapters,
        filter    : /(.+Adapter)\.(js|coffee|litcoffee)$/,
        replaceExpr : /Adapter/,
        flattenDirectories: true
      }, cb);
    },




    /**
     * Load app's model definitions
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadModels: function (cb) {
      // Get the main model files
      buildDictionary.optional({
        dirname   : sails.config.paths.models,
        filter    : /^([^.]+)\.(js|coffee|litcoffee)$/,
        replaceExpr : /^.*\//,
        flattenDirectories: true
      }, function(err, models) {
        if (err) {return cb(err);}
        // Get any supplemental files
        buildDictionary.optional({
          dirname   : sails.config.paths.models,
          filter    : /(.+)\.attributes.json$/,
          replaceExpr : /^.*\//,
          flattenDirectories: true
        }, function(err, supplements) {
          if (err) {return cb(err);}
          return cb(null, sails.util.merge(models, supplements));
        });
      });
    },




    optional: buildDictionary.optional,
    required: buildDictionary.required,
    aggregate: buildDictionary.aggregate,
    exits: buildDictionary.exists

  };

};
