'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema;

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
    country: {
      type: String,
      default: '',
      trim: true
    },
    zipCode: {
      type: Number,
      default: null,
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    }
  },
  eudcation: [{
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
      trim: true
    },
    endDate: {
      type: Date,
      default: null,
      trim: true
    },
    concentration: {
      type: String,
      default: '',
      trim: true
    },
    country: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    }
  }],
  jobExperience: [{
    employer: {
      type: String,
      default: '',
      trim: true
    },
    title: {
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
      trim: true
    },
    endDate: {
      type: Date,
      default: null,
      trim: true
    }
  }],
  certification: [{
    name: {
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
      trim: true
    },
    dateExpired: {
      type: Date,
      default: null,
      trim: true
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
    dateStart: {
      type: Date,
      default: null,
      trim: true
    },
    dateEnd: {
      type: Date,
      default: null,
      trim: true
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
