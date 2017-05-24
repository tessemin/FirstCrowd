'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/*
 * Enterprise Schema
 */
var EnterpriseUserSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  companyName: {
    type: String,
    required: 'Please provide a Company Name'
  },
  companyAddress: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  industryClassification: [{ // an array
    type: String,
    default: ''
  }],
  primaryCountry: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  yearEstablished: {
    type: Number,
    default: null
  },
  employeeCount: {
    type: Number,
    default: null
  }
});

mongoose.model('Enterprise', EnterpriseUserSchema);
