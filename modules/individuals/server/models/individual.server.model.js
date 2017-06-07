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
  if (date === null) {
    return true;
  }
  return date instanceof Date;
};

var validateStartLessThanEnd = function(endDate) {
  var startDate = null;
  if (this.startDate) {
    startDate = this.startDate;
  } else if (this.dateIssued) {
    startDate = this.dateIssued;
  } else if (this.firstUsed) {
    startDate = this.firstUsed;
  } else {
    return false;
  }
  if (startDate === null && endDate === null) {
    return true;
  }
  return ((endDate) > (startDate));
};

var validateAge = function(birthday) {
  if (birthday == null) {
    return true;
  }
  let cutOff = new Date();
  cutOff.setFullYear(cutOff.getFullYear() - 130);
  return birthday >= cutOff;
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
      trim: true,
      validate: [validateAge, 'Date of Birth must be at least 130 years prior to todays date']
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
      validate: [
        { validator: validateDate, msg: 'End Date is not in the correct form' },
        { validator: validateStartLessThanEnd, msg: 'End Date is less than the start date' }
      ]
    },
    concentration: [{
      type: String,
      default: '',
      trim: true
    }],
    major: [{
      type: String,
      default: '',
      trim: true
    }],
    minor: [{
      type: String,
      default: '',
      trim: true
    }]
    address: {
      schoolCountry: {
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
      validate: [
        { validator: validateDate, msg: 'End Date is not in the correct form' },
        { validator: validateStartLessThanEnd, msg: 'End Date is less than the start date' }
      ]
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
      validate: [
        { validator: validateDate, msg: 'Date Expired is not in the correct form' },
        { validator: validateStartLessThanEnd, msg: 'Date Expired is less than the Date Issued' }
      ]
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  }],
  skills: [{
    skill: {
      type: Schema.Types.Mixed,
      default: null
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
      validate: [
        { validator: validateDate, msg: 'End Date is not in the correct form' },
        { validator: validateStartLessThanEnd, msg: 'End Date is less than the date Start' }
      ]
    },
    locationLearned: [{
      type: String,
      default: '',
      trim: true
    }],
    tools: [{
      tool: Schema.Types.Mixed,
      default: {}
    }],
    specialities: [{
      speciality: Schema.Types.Mixed,
      default: {}
    }]
  }]
});


IndividualUserSchema.pre('save', function (next) {
  next();
});


mongoose.model('Individual', IndividualUserSchema);
