'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Individual Schema
 */
var IndividualSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Individual name',
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

mongoose.model('Individual', IndividualSchema);
