'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Individuals Permissions
 */
module.exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/individuals',
      permissions: '*'
    }, {
      resources: '/api/individuals/:individualId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/individuals',
      permissions: ['get', 'post']
    }, {
      resources: '/api/individuals/:individualId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/individuals',
      permissions: ['get']
    }, {
      resources: '/api/individuals/:individualId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Individuals Policy Allows
 */
module.exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Individual is being processed and the current user created it then allow any manipulation
  if (req.individual && req.user && req.individual.user && req.individual.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
