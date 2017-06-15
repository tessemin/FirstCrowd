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
    type: String,
    default: '',
    required: 'Please fill Requester name',
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

mongoose.model('Requester', RequesterSchema);
