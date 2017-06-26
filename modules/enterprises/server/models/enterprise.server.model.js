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
  if (year === null) {
    return true;
  }
  return ((((new Date()).getFullYear() + 1) > year) && (year >= 0));
};

var validateBiggerThanZero = function(num) {
  if (num === null) {
    return true;
  }
  return num >= 0;
};

var validateURL = function(URL) {
  if (URL === '') {
    return true;
  }
  return validator.isURL(URL);
};

/*
 * Enterprise Schema
 */
var EnterpriseUserSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Cannot have a entperise without a user'
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
      code: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      }
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
  specialities: [{
    type: Schema.Types.Mixed,
    default: null
  }],
  productsCatalog: [{
    type: Schema.Types.Mixed,
    default: null
  }],
  serviceCatalog: [{
    type: Schema.Types.Mixed,
    default: null
  }],
  partners: {
    supplier: [{
      companyName: {
        type: String,
        default: '',
        trim: true,
        required: 'Must have a company name to save this supplier'
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
        trim: true,
        required: 'Must have a company name to save this customer'
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
        trim: true,
        required: 'Must have a company name to save this competitor or peer'
      },
      URL: {
        type: String,
        default: '',
        trim: true,
        validate: [validateURL, 'Website must be in form: \'site.domain\'']
      }
    }]
  },
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
    completedTasks: [{
      task: {
        type: Schema.Types.ObjectId
      },
      hidden: {
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
    acceptanceRate: {
      type: Number,
      default: 0.0
    },
    interestedCategories: [{
      type: Schema.Types.Mixed
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
EnterpriseUserSchema.pre('save', function (next) {
  next();
});

mongoose.model('Enterprise', EnterpriseUserSchema);
