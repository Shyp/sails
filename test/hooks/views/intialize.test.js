/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var Sails = require('../../../lib').constructor;


describe('Views hook', function (){

  var app;


  it('should initialize as long as the http hook is included (even without the session hook)', function (done) {

    app = new Sails();
    app.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
      ]
    }, done);
  });


  it('should initialize w/ the session hook', function (done) {

    app = new Sails();
    app.load({
      globals: false,
      loadHooks: [
        'moduleloader',
        'userconfig',
        'http',
        'session',
      ]
    }, done);
  });

});

