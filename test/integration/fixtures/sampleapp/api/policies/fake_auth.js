/**
 * Fake Auth Policy Fixture
 *
 * Fakes an Authentication
 */

module.exports = function(req, res, next) {
  req.authenticated = true;
  next();
};
