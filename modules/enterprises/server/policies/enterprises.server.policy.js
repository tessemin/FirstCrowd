'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Enterprises Permissions
 */
module.exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/enterprises',
      permissions: '*'
    }, {
      resources: '/api/enterprises/:enterpriseId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/enterprises',
      permissions: ['get', 'post']
    }, {
      resources: '/api/enterprises/:enterpriseId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/enterprises',
      permissions: ['get']
    }, {
      resources: '/api/enterprises/:enterpriseId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Enterprises Policy Allows
 */
module.exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Enterprise is being processed and the current user created it then allow any manipulation
  if (req.enterprise && req.user && req.enterprise.user && req.enterprise.user.id === req.user.id) {
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
