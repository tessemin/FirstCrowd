'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  fs = require('fs'),
  mkdirp = require('mkdirp');
  
function makeDirectory(dir, callBack) {
  if (!fs.existsSync(dir)){
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

function writeFilesToPath(file, dirPath, callBack, next) {
  fs.readFile(file.path, function (err, data) {
    if (err) {
      return callBack(err);
    }
    var oldPath = file.path;
    // set the correct path for the file not the temporary one from the API:
    file.name = file.name.replace(/ /g, '_');
    var dir = path.resolve('.' + dirPath) ;
    file.path = path.resolve(dir + '/' + file.name);
    // copy the data from the req.files.file.path and paste it to file.path
    makeDirectory(dir, function (err) {
      if (err) return callBack(err);
      fs.access(dir, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) return callBack(err);
        fs.writeFile(file.path, data, function (err) {
          if (err) return callBack(err);
          fs.unlink(oldPath, function (err) {
            if (err) return callBack(err);
            
            if (next)
              return next(dirPath, callBack, next);
            else
              return callBack();
          });
        });
      });
    });

  });
}

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}

function getTimeInMinutes(milli) {
  var date = null;
  if (milli)
    date = new Date(milli);
  else
    date = new Date();
  return parseInt(((date.getTime())/1000*60), 10).toString();
}

exports.getDirectories = getDirectories;
exports.writeFilesToPath = writeFilesToPath;
exports.makeDirectory = makeDirectory;
exports.getTimeInMinutes = getTimeInMinutes;
