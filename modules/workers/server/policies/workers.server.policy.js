'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Workers Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/workers/activeTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/activeTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/rejectedTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/rejectedTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/completedTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/completedTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/inactiveTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/inactiveTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/recomendedTasks/',
      permissions: ['get']
    }, {
      resources: 'api/workers/recomendedTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/workers',
      permissions: ['get', 'post']
    }, {
      resources: '/api/workers/:workerId',
      permissions: ['get']
    }]
  }, {
    roles: ['worker'],
    allows: [{
      resources: '/api/workers/activeTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/activeTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/rejectedTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/rejectedTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/completedTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/completedTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/inactiveTasks/',
      permissions: ['get', 'post']
    }, {
      resources: 'api/workers/inactiveTask/:taskId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workers/recomendedTasks/',
      permissions: ['get']
    }, {
      resources: 'api/workers/recomendedTask/:taskId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Workers Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Worker is being processed and the current user created it then allow any manipulation
  if (req.worker && req.user && req.worker.user && req.worker.user.id === req.user.id) {
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
