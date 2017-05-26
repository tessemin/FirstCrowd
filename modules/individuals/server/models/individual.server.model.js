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
    organization: {
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
