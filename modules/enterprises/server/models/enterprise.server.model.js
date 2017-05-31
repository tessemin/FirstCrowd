'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema;

/*
 * Enterprise Schema
 */
var EnterpriseUserSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  profile: {
    companyName: {
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
    yearEstablished: {
      type: Number,
      default: null
    },
    employeeCount: {
      type: Number,
      default: null
    },
    companyAddress: {
      country: {
        type: String,
        default: '',
        trim: true
      },
      countryCode: {
        type: String,
        default: '',
        trim: true
      },
      streetAddress: {
        type: String,
        default: '',
        trim: true
      },
      city: {
        type: String,
        default: '',
        trim: true
      },
      state: {
        type: String,
        default: '',
        trim: true
      },
      zipCode: {
        type: Number,
        default: null,
        trim: true
      }
    }
  },
  partners: {
    supplier: [{
      companyName: {
        type: String,
        default: ''
      },
      URL: {
        type: String,
        default: ''
      }
    }],
    customer: [{
      companyName: {
        type: String,
        default: ''
      },
      URL: {
        type: String,
        default: ''
      }
    }],
    competitor: [{
      companyName: {
        type: String,
        default: ''
      },
      URL: {
        type: String,
        default: ''
      }
    }]
  }
});

EnterpriseUserSchema.pre('save', function (next) {
  next();
});

mongoose.model('Enterprise', EnterpriseUserSchema);
