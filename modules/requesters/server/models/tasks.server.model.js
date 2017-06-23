'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  validator = require('validator'),
  Schema = mongoose.Schema;

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
    trim: true
  },
  payment: {
    bidding: {
      bidable: {
        type: Boolean,
        default: false
      },
      startingPrice: {
        type: Number,
        default: 0.00
      },
      minPrice: {
        type: Number,
        default: 0.00
      },
      timeRange: {
        start: {
          type: Date,
          default: null
        },
        end: {
          type: Date,
          default: null
        }
      }
    },
    staticPrice: {
      type: Number,
      required: 'Please provide a price'
    }
  },
  status: {
    type: String,
    enum: ['open', 'inactive', 'taken', 'suspended', 'sclosed', 'fclosed'],
    required: 'Please provide a status'
  },
  multiplicity: {
    type: Number,
    default: 1
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
    type: Schema.Types.ObjectId,
    required: 'Please provide a requester'
  },
  workers: {
    type: [{
      status: {
        type: String,
        enum: ['active', 'accepted', 'rejected']
      },
      ratingOnWorker: {
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
      },
      ratingOnRequester: {
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
      },
      worker: {
        type: Schema.Types.ObjectId,
        required: 'Must include a worker'
      },
      progress: {
        type: Number,
        default: 0
      }
    }]
  },
  bids: [{
    worker: {
      type: Schema.Types.ObjectId
    },
    bid: {
      type: Number,
      required: 'Please provide a bid'
    },
    status: {
      type: String,
      enum: ['accepted', 'rejected', 'undecided'],
      default: ['undecided']
    }
  }],
  publicNotes: [{
    note: {
      type: String,
      required: 'Please fill out the note',
      deafult: null
    },
    date: {
      type: Date,
      default: null,
      trim: true
    }
  }],
  privateNotes: [{
    note: {
      type: String,
      required: 'Please fill out the note',
      deafult: null
    },
    date: {
      type: Date,
      default: null,
      trim: true
    }
  }],
  permaHidden: {
    type: Boolean,
    default: false
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
  this.lastModified = Date.now()
  next();
});

mongoose.model('Task', TaskSchema);
