'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
    firstName: {
      type: String,
      default: ''
    },
    middleName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: Date,
      default: ''
    },
    sex: {
      type: String,
      enum: ['male', 'female']
    },
    profession: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    zipCode: {
      type: Number,
      default: null
    },
    address: {
      type: String,
      default: ''
    }
  },
  education: [{
    degreeLevel: {
      type: String,
      default: ''
    },
    schoolName: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    concentration: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  }],
  jobExperience: [{
    employer: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    skills: [{
      type: String,
      default: ''
    }],
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  }],
  certification: [{
    name: {
      type: String,
      default: ''
    },
    organization: {
      type: String,
      default: ''
    },
    dateIssued: {
      type: Date,
      default: null
    },
    dateExpired: {
      type: Date,
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  }],
  skills: [{
    skill: {
      type: String,
      default: ''
    },
    dateStart: {
      type: Date,
      default: null
    },
    dateEnd: {
      type: Date,
      default: null
    },
    locationLearned: [{
      type: String,
      default: ''
    }]
  }]
});

IndividualUserSchema.set('collection', 'individualusers');

/**
 * set first and last name as same for user and individual
 */
IndividualUserSchema.pre('save', function (next) {
  if (this.user.firstName !== '') {
    this.bio.firstName = this.user.firstName;
  } else if (this.bio.firstName !== '') {
    this.user.firstName = this.bio.firstName;
  }
  if (this.user.lastName !== '') {
    this.bio.lastName = this.user.lastName;
  } else if (this.bio.lastName !== '') {
    this.user.lastName = this.bio.lastName;
  }
  this.user.displayName = this.first + ' ' + this.last;
  next();
});


mongoose.model('Individual', IndividualUserSchema);
