'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

// gets the ids in a task/worker/requester array in form:
/*
 [data: 'some data'
  taskId: 12345abc]
*/
module.exports.getIdsInArray = function(array) {
  var idArray = [];
  for (var i = 0; i < array.length; i++)
    if (array[i])
      if (array[i].taskId)
        idArray.push(array[i].taskId);
  return idArray;
};

//checks if the user is a requester
module.exports.isRequester = function(user) {
  if (user.userRole)
    if (user.userRole.indexOf('requester') > -1)
      return true;
  return false;
};

// checks if the user is a worker
module.exports.isWorker = function(user) {
  if (user.userRole)
    if (user.userRole.indexOf('worker') > -1)
      return true;
  return false;
};

// checks if the user owns a task
module.exports.ownsTask = function(task, typeObj) {
  return task.requester.requesterId.toString() === typeObj._id.toString();
};

// this gets sproperties nested like prop1.prop2.prop3 and will return the value for prop3 in form:
/* {
  prop1: {
    prop2: { prop3: 'value' }
  }
}*/
module.exports.getNestedProperties = function(object, propertyNames) {
  if (object) {
    var returnObjs = {},
      parts = null,
      nestedObj = null,
      property = null;
    for (var prop = 0; prop < propertyNames.length; prop++) {
      if (propertyNames[prop].includes('.')) {
        parts = propertyNames[prop].split('.');
        nestedObj = returnObjs;
        property = object || this;
        var i = 0,
          part = null;
        for (i = 0; i < parts.length; i++) {
          part = parts[i];
          property = property[part];
          if (!nestedObj[part] && property)
            nestedObj[part] = {};
          if (i < parts.length - 1)
            nestedObj = nestedObj[part];
          if (!property)
            break;
        }
        if (property) {
          nestedObj[parts[i - 1]] = property;
        }
      } else {
        if (object[propertyNames[prop]]) {
          returnObjs[propertyNames[prop]] = object[propertyNames[prop]];
        }
      }
    }
    return returnObjs;
  }
  return null;
};

// hashes an object id to a smaller value
module.exports.hashObjId = function(id) {
  if (id) {
    id = id.toString();
    var returnVal = null;
    for (var i = 1; i <= id.length; i++) {
      returnVal += id.codePointAt(i - 1) * i;
    }
    if (returnVal)
      return returnVal.toString(16);
  }
  return null;
};

_.extend(
  module.exports,
  require('./task.actions/task.actions.depend'),
  require('./task.file/task.file.depend'),
  require('./task.search/task.search.depend')
);
