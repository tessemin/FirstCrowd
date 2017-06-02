'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  validator = require('validator');
  
var validateYearEstablished = function(year) {
  return (((new Date()).getFullYear() + 1) > year);
};

var validateBiggerThanZero = function(num) {
  return num >= 0;
};

var validateURL = function(URL) {
  return validator.isURL(URL);
}

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
      default: '',
      trim: true
    },
    countryOfBusiness: {
      type: String,
      default: '',
      trim: true
    },
    URL: {
      type: String,
      default: '',
      trim: true,
      validate: [validateURL, 'Website must be in form: \'site.domain\'']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    classifications: [{ // an array
      type: String,
      default: '',
      trim: true
    }],
    yearEstablished: {
      type: Number,
      default: null,
      validate: [
        { validator: validateYearEstablished, msg: 'Year Established must be before this year or earlier' },
        { validator: validateBiggerThanZero, msg: 'Year Established must be greater than or equal to zero.' }
      ]
    },
    employeeCount: {
      type: Number,
      default: null,
      validate: [validateBiggerThanZero, 'Employee Count must be greater than or equal to zero.']
    },
    companyAddress: {
      country: {
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
        default: null
      }
    }
  },
  partners: {
    supplier: [{
      companyName: {
        type: String,
        default: '',
        trim: true
      },
      URL: {
        type: String,
        default: '',
        trim: true,
        validate: [validateURL, 'Website must be in form: \'site.domain\'']
      }
    }],
    customer: [{
      companyName: {
        type: String,
        default: '',
        trim: true
      },
      URL: {
        type: String,
        default: '',
        trim: true,
        validate: [validateURL, 'Website must be in form: \'site.domain\'']
      }
    }],
    competitor: [{
      companyName: {
        type: String,
        default: '',
        trim: true
      },
      URL: {
        type: String,
        default: '',
        trim: true,
        validate: [validateURL, 'Website must be in correct form']
      }
    }]
  }
});

EnterpriseUserSchema.pre('save', function (next) {
  next();
});

mongoose.model('Enterprise', EnterpriseUserSchema);
