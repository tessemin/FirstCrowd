'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  validator = require('validator'),
  Schema = mongoose.Schema;
  
var validateDate = function(date) {
  // todo add date validation
  console.log(date);
  date = validator.toDate(date) 
  console.log(date);
  //return validator.isISO8601(date);
};
/*
 * Individual Schema
 */
var IndividualUserSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  bio: {
    dateOfBirth: {
      type: Date,
      default: '',
      trim: true
    },
    sex: {
      type: String,
      enum: ['male', 'female']
    },
    profession: {
      type: String,
      default: '',
      trim: true
    },
    address: {
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
  degrees: [{
    degreeLevel: {
      type: String,
      default: '',
      trim: true
    },
    schoolName: {
      type: String,
      default: '',
      trim: true
    },
    startDate: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'Start Date is not in the correct form']
    },
    endDate: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'End Date is not in the correct form']
    },
    concentration: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      schoolCountry: {
        type: String,
        default: '',
        trim: true
      },
      schoolCountryCode: {
        type: String,
        default: '',
        trim: true
      },
      schoolStreetAddress: {
        type: String,
        default: '',
        trim: true
      },
      schoolCity: {
        type: String,
        default: '',
        trim: true
      },
      schoolState: {
        type: String,
        default: '',
        trim: true
      },
      schoolZipCode: {
        type: Number,
        default: null,
        trim: true
      }
    }
  }],
  jobExperience: [{
    employer: {
      type: String,
      default: '',
      trim: true
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    skills: [{
      type: String,
      default: '',
      trim: true
    }],
    startDate: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'Start Date is not in the correct form']
    },
    endDate: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'End Date is not in the correct form']
    }
  }],
  certification: [{
    certificationName: {
      type: String,
      default: '',
      trim: true
    },
    institution: {
      type: String,
      default: '',
      trim: true
    },
    dateIssued: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'Date Isssued is not in the correct form']
    },
    dateExpired: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'Date Expired is not in the correct form']
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  }],
  skills: [{
    skill: {
      type: String,
      default: '',
      trim: true
    },
    firstUsed: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'Start Date is not in the correct form']
    },
    lastUsed: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'End Date is not in the correct form']
    },
    locationLearned: [{
      type: String,
      default: '',
      trim: true
    }]
  }]
});


IndividualUserSchema.pre('save', function (next) {
  next();
});


mongoose.model('Individual', IndividualUserSchema);
