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
  if ((startDate === null && endDate === null) || endDate === null) {
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
    ref: 'User',
    required: 'Individual must be conected to a User'
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
  schools: [{
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
    degrees: [{
      name: {
        type: String,
        default: '',
        trim: true
      },
      degreeLevel: {
        type: String,
        default: '',
        trim: true
      },
      concentration: [{
        type: String,
        default: '',
        trim: true
      }]
    }],
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
      default: {}
    },
    firstUsed: {
      type: Date,
      default: null,
      trim: true,
      validate: [validateDate, 'First used is not in the correct form']
    },
    lastUsed: {
      type: Date,
      default: null,
      trim: true,
      validate: [
        { validator: validateDate, msg: 'Last used is not in the correct form' },
        { validator: validateStartLessThanEnd, msg: 'Last used is less than the First used' }
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
  }],
  requester: {
    activeTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    suspendedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    acceptedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    failedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    acceptanceRate: {
      type: Number,
      default: 0.0
    },
    interestedCategories: [{
      type: Schema.Types.Mixed
    }],
    workerRatings: [{
      workerID: Schema.Types.ObjectId,
      overAllRating: {
        type: Number,
        default: 0.0
      },
      clearness: {
        type: Number,
        default: 0.0
      },
      resonableness: {
        type: Number,
        default: 0.0
      },
      responseTime: {
        type: Number,
        default: 0.0
      }
    }],
    workersPerCategory: [{
      category: {
        type: Schema.Types.Mixed
      },
      number: {
        type: Number,
        default: 0
      }
    }],
    totalPayments: {
      type: Number,
      default: 0.00
    },
    numberOfHiredWorkers: {
      type: Number,
      default: 0
    }
  },
  worker: {
    activeTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      },
      markCompleted: {
        type: Boolean,
        default: false
      }
    }],
    rejectedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    completedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    inactiveTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    recomendedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
        type: Boolean,
        default: false
      }
    }],
    totalEarnings: {
      type: Number,
      default: 0.0
    },
    requesterRatingsPerCategory: [{
      requester: Schema.Types.ObjectId,
      category: {
        type: Schema.Types.Mixed
      },
      rate: {
        type: Number,
        default: 0.0
      }
    }],
    acceptanceRatesPerCategory: {
      category: {
        type: Schema.Types.Mixed
      },
      number: {
        type: Number,
        default: 0
      }
    },
    acceptanceRate: {
      type: Number,
      default: 0.0
    },
    preferedCategories: [{
      category: Schema.Types.Mixed,
      numberCompleted: {
        type: Number,
        default: 0
      }
    }],
    averageCompletionTime: { // in seconds
      type: Number,
      default: 0
    },
    averageEarnedPerTask: {
      type: Number,
      default: 0.00
    }
  },
  owner: {
    resources: [{
      type: Schema.Types.Mixed
    }],
    workerRating: [{
      worker: Schema.Types.ObjectId,
      rating: {
        type: Number,
        default: 0.0
      }
    }],
    requesterRating: [{
      requester: Schema.Types.ObjectId,
      rating: {
        type: Number,
        default: 0.0
      }
    }]
  }
});

IndividualUserSchema.pre('save', function (next) {
  next();
});


mongoose.model('Individual', IndividualUserSchema);
