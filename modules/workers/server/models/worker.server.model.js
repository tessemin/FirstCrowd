'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Worker Schema
 */
var WorkerSchema = new Schema({
  name: {
    type: String
  }
});

module.exports = WorkerSchema;

mongoose.model('Worker', WorkerSchema);
