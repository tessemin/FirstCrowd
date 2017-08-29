'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  glob = require('glob'),
  _ = require('lodash'),
  fs = require('fs'),
  config = require(path.resolve('./config/config')),
  moduleDependants = null;

var getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
};

// gets all depend in all module includes files
if (!moduleDependants) {
  (function readModuleDepend() {
    moduleDependants = {};
    var modPath = path.resolve('./modules');
    var dirs = getDirectories(modPath);
    dirs.forEach(function(dir) {
      dir = path.resolve(modPath + '/' + dir + '/server/controllers');
      glob(dir + '\\**.includes.js', {}, function (err, files) {
        if (err) {        
          console.log(err);
        } else if (files.length > 0) {
          files.forEach(function (file) {
            var check = (require(file)).depend;
            for (var key in check) {
              if (moduleDependants[key])
                console.log((new Error('Dependancy -- ' + key + ' has been declared twice as a dependency.')).stack);
            }
            _.merge(moduleDependants, (require(file)).depend);
          });
          moduleDependants = flatenObject(moduleDependants);
        }
      });
    });
  }());
}

// flatens a object, with the first key being the key that is kept
function flatenObject(obj) {
  var flattenedObj = {};
  Object.keys(obj).forEach(function(key) {
    if (typeof obj[key] === 'object') {
      _.extend(flattenedObj, flatenObject(obj[key]));
    } else {
      if (!flattenedObj[key])
        flattenedObj[key] = obj[key];
    }
  });
  return flattenedObj; 
}
module.exports.flatenObject = flatenObject;

// a exportable function that can be used to get the dependant by the key value
// this is usable when their is cross module or cross sub-module support needed
function getDependantByKey(key) {
  return function() {
    if (moduleDependants[key])
      return moduleDependants[key].apply(this, arguments);
    console.log((new Error('getDependantByKey(\'' + key + '\') returns null, no module dependant referenced by key.')).stack);
    return null;
  };
}
module.exports.getDependantByKey = getDependantByKey;

module.exports.declareDependantVariables = function(keys) {
  console.log('\n' + ((new Error()).stack).split('\n')[2].replace('at Object.<anonymous> (C:\\Users\\adam\\Desktop\\FirstCrowd', '').replace(')', '').trim() + '\n');
  if (keys && keys.length > 0) {
    var code = '';
    code += '// decalre dependant functions\n';
    code += 'var moduleDependencies = require(path.resolve(\'./modules/core/server/controllers/modules.depend.server.controller\'));\n';
    code += 'var dependants = [\'' + keys.join('\', \'') + '\'];\n';
    code += 'var ' + keys.join(', ') + ';\n';
    code += '[' + keys.join(', ') + '] = moduleDependencies.assignDependantVariables(dependants);\n';
    console.log(code);
    console.log('\n\n');
  }
  return null;
};

exports.assignDependantVariables = function(keys) {
  var vars = [];
  keys.forEach(function(key) {
    vars.push(getDependantByKey(key));
  });
  return vars;
};
