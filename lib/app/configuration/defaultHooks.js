/**
 * Default hooks
 * (order matters)
 * TODO: make order _not_ matter
 */

module.exports = [
  'moduleloader',
  'logger',
  'request',
  'orm',
  'views',
  'blueprints',
  'responses',
  'controllers',
  'policies',
  'services',
  'userconfig',
  'http',
];
