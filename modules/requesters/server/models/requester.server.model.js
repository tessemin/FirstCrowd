'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Requester Schema
 */
var RequesterSchema = new Schema({
  name: {
    type: String
  }
});

mongoose.model('Requester', RequesterSchema);
