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
    type: String,
    default: '',
    required: 'Please fill Worker name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Worker', WorkerSchema);
