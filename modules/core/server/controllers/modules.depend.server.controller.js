'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  glob = require('glob'),
  _ = require('lodash'),
  fs = require('fs'),
  config = require(path.resolve('./config/config')),
  mkdirp = require('mkdirp'),
  // decalre the share modular dependencies
  moduleDependants = null;

// get the directories with the specified directory
var getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
};

// make a full directory path
function makeDirectory(dir, callBack) {
  if (!fs.existsSync(dir)) {
    mkdirp(dir, function (err) {
      if (err)
        return callBack(err);
      else
        return callBack();
    });
  } else {
    return callBack();
  }
}

// gets all depend in all module includes files
if (!moduleDependants) {
  (function readModuleDepend() {
    moduleDependants = {};
    // get all modules in the project
    var modPath = path.resolve('./modules');
    var dirs = getDirectories(modPath);
    dirs.forEach(function(dir) {
      // find each server controller
      dir = path.resolve(modPath + '/' + dir + '/server/controllers');
      // get the include files
      glob(dir + '/*.includes.js', {}, function (err, files) {
        if (err) {
          console.log(err);
        } else if (files.length > 0) {
          files.forEach(function (file) {
            var check = (require(file)).depend;
            for (var key in check) {
              // thow an error if there is more than one dependency with the same name
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
    console.error((new Error('getDependantByKey(\'' + key + '\') returns null, no module dependant referenced by key.')).stack);
    return null;
  };
}
module.exports.getDependantByKey = getDependantByKey;

// this is a function that can help you decalre the functions you need
// it doent actually declare the function, just prints what you should write to the console
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

// get multiple dependencies in a mass assignment operation
exports.assignDependantVariables = function(keys) {
  printAssignedDependantsToFile(keys);
  var vars = [];
  keys.forEach(function(key) {
    vars.push(getDependantByKey(key));
  });
  return vars;
};

/*------------------------ THESE FUNCTIONS ARE FOR DOCUMENTATION ONLY -------------------------------------*/

var assignedDependantsDirectory = path.resolve('./resources/dependancies/');
var assignedDependantsFile = path.resolve(assignedDependantsDirectory + '/filesDependants.json');
var assignedDependantsFileCleared = false;
var assignedDependantsObj = { 'files': {} };

// clear the file where the exports are stored
if(!assignedDependantsFileCleared) {
  assignedDependantsFileCleared = true;
  makeDirectory(assignedDependantsDirectory, function(err) {
    if (err) {
      return console.log(err);
    }
    fs.writeFile(assignedDependantsFile, JSON.stringify({ files: {} }), 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
    });
  });
}

// populate the documentation file for the export
var timeOut = null;
function printAssignedDependantsToFile(keys) {
  if (timeOut)
    clearTimeout(timeOut)
  var stack = (new Error).stack;
  var fileLine = stack.split('\n')[3];
  var projectName = 'FirstCrowd';
  var n = fileLine.indexOf(projectName);
  fileLine = fileLine.substring(n !== -1 ? n + projectName.length : 0, fileLine.length).trim();
  n = fileLine.indexOf(':');
  fileLine = fileLine.substring(0, n !== -1 ? n : fileLine.length).trim();
  assignedDependantsObj.files[fileLine] = {};
  assignedDependantsObj.files[fileLine].filePath = fileLine;
  assignedDependantsObj.files[fileLine].dependencies = keys;
  //assignedDependantsObj.files[fileLine].exports = require(path.resolve(fileLine));

  timeOut = setTimeout(function() {
    fs.writeFile(assignedDependantsFile, JSON.stringify(assignedDependantsObj, null, 2), 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }, 5000);
}
