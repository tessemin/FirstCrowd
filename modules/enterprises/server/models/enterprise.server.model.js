'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Enterprise Schema
 */
var EnterpriseSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Enterprise name',
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

mongoose.model('Enterprise', EnterpriseSchema);
