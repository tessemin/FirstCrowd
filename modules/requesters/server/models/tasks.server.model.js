'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  validator = require('validator'),
  Schema = mongoose.Schema;

var validateDateAfterNow = function(date) {
  if (!date)
    return true;
  return (new Date(date)).getTime() > (new Date()).getTime();
};

var validateStartBeforeEnd = function(timeRange) {
  if (!timeRange.end && !timeRange.start)
    return true;
  if (!timeRange.end || !timeRange.start)
    return false;
  return (new Date(timeRange.end)).getTime() > (new Date(timeRange.start)).getTime();
};

var validateBiggerThanZero = function(num) {
  return num > 0;
};

var validateBiggerThanEqualZero = function(num) {
  if (!num)
    return true;
  return num >= 0;
};

var validateBidPrices = function() {
  if(!this.payment.bidding.bidable)
    return true;
  return this.payment.bidding.startingPrice >= this.payment.bidding.minPrice;
};

var validateProgress = function(num) {
  return num >= 0 && num <= 100;
};

var validateBiddingBeforeDeadline = function(timeRange) {
  if(!this.payment.bidding.bidable)
    return true;
  return (new Date(timeRange.end).getTime() < (new Date(this.deadline)).getTime());
}

var validateBiddingStartBeforeNow = function(timeRange) {
  return validateDateAfterNow(timeRange.start);
};
  
/**
 * Requester Schema
 */
var TaskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: 'Please provide a title'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: Schema.Types.Mixed
  },
  skillsNeeded: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date,
    default: null,
    trim: true,
    required: 'Must have a deadline after today.',
    validate: [validateDateAfterNow, 'Deadline must be after todays date']
  },
  totalProgress: {
    type: Number,
    default: 0
  },
  payment: {
    bidding: {
      bidable: {
        type: Boolean,
        default: false
      },
      startingPrice: {
        type: Number,
        default: 0,
        validate: [
          { validator: validateBiggerThanEqualZero, msg: 'Starting Bid must be zero or larger.' },
          { validator: validateBidPrices, msg: 'Default/Starting Bid must be greater than or equal to the Minimum Bid' }
        ]
      },
      minPrice: {
        type: Number,
        default: 0,
        validate: [
          { validator: validateBiggerThanEqualZero, msg: 'Minimum Bid must be zero or larger.' },
          { validator: validateBidPrices, msg: 'Default/Starting Bid must be greater than or equal to the Minimum Bid' }
        ]
      },
      timeRange: {
        type: {
          start: {
            type: Date,
            default: null
          },
          end: {
            type: Date,
            default: null
          }
        },
        validate: [
          { validator: validateStartBeforeEnd, msg: 'Bidding Start Date must be before end date' },
          { validator: validateBiddingBeforeDeadline, msg: 'Bidding must end before the deadline.' },
          { validator: validateBiddingStartBeforeNow, msg: 'Bidding Start Date must be after todays date' }
        ]
      }
    },
    staticPrice: {
      type: Number,
      default: null,
      validate: [validateBiggerThanEqualZero, 'Success Factor must be greater than zero.']
    },
    paymentInfo: {
      paymentType: {
        type: String,
        enum: ['paypal'],
        default: 'paypal',
        required: 'Please provide a payment type'
      },
      paid: {
        type: Boolean,
        default: false
      },
      paymentId: {
        type: String
      },
      payerId: {
        type: String
      },
      paymentObject: {
        type: Schema.Types.Mixed
      }
    }
  },
  status: {
    type: String,
    enum: ['open', 'inactive', 'taken', 'suspended', 'sclosed', 'fclosed'],
    default: 'inactive',
    required: 'Please provide a status'
  },
  multiplicity: {
    type: Number,
    default: 1
  },
  successFactor: {
    // this is the number of sccesses needed for the project to be considered a sccuess
    type: Number,
    default: 1,
    validate: [validateBiggerThanZero, 'Success Factor must be greater than zero.']
  },
  preapproval: {
    type: Boolean,
    default: true
  },
  secret: {
    type: Boolean,
    default: false
  },
  requester: {
    requesterType: {
      enterprise: {
        type: Boolean
      },
      individual: {
        type: Boolean
      }
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      required: 'Please provide a requester'
    }
  },
  jobs: {
    type: [{
      status: {
        type: String,
        enum: ['active', 'accepted', 'rejected', 'submitted', 'quit', 'suspended'],
        required: 'Please provide a status'
      },
      ratingOnWorker: {
        overAllRating: {
          type: Number
        }
      },
      ratingOnRequester: {
        overAllRating: {
          type: Number
        }
      },
      worker: {
        workerType: {
          enterprise: {
            type: Boolean
          },
          individual: {
            type: Boolean
          }
        },
        workerId: {
          type: Schema.Types.ObjectId,
          required: 'Please provide a worker'
        }
      },
      progress: {
        type: Number,
        default: 0,
        validate: [validateProgress, 'Progress must be between 0 and 100']
      },
      timeSpent: { // in seconds
        type: Number,
        default: 1,
        validate: [validateBiggerThanZero, 'Time Spent must be greater than zero.']
      },
      awardAmount: {
        type: Number,
        default: 0
      },
      paymentRecieved: {
        type: Date,
        default: null
      },
      dateStarted: {
        type: Date,
        default: null
      }
    }],
    default: []
  },
  bids: {
    type: [{
      worker: {
        workerType: {
          enterprise: {
            type: Boolean
          },
          individual: {
            type: Boolean
          }
        },
        workerId: {
          type: Schema.Types.ObjectId,
          required: 'Please provide a worker'
        }
      },
      bid: {
        type: Number,
        required: 'Please provide a bid',
        validate: [validateBiggerThanEqualZero, 'Bid must be zero or larger.']
      },
      status: {
        type: String,
        enum: ['accepted', 'rejected', 'undecided'],
        default: 'undecided'
      }
    }],
    default: []
  },
  publicNotes: {
    type: [{
      note: {
        type: String,
        required: 'Please fill out the note',
        deafult: null
      },
      dateCreated: {
        type: Date,
        default: null,
        trim: true
      }
    }],
    default: []
  },
  privateNotes: {
    type: [{
      note: {
        type: String,
        required: 'Please fill out the note',
        deafult: null
      },
      dateCreated: {
        type: Date,
        default: null,
        trim: true
      }
    }],
    default: []
  },
  dateCreated: {
    type: Date,
    required: 'Please add a date created'
  },
  lastModified: {
    type: Date,
    default: null
  }
});

TaskSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});

mongoose.model('Task', TaskSchema);
