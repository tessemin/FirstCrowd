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
    type: [{
      type: String,
      enum: ['open', 'inactive', 'taken', 'suspended', 'closed', 'accepted', 'rejected']
    }],
    required: 'Please provide at least one status'
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
    type: {
      active: [{
        type: Schema.Types.ObjectId
      }],
      accepted: [{
        type: Schema.Types.ObjectId
      }],
      rejected: [{
        type: Schema.Types.ObjectId
      }]
    },
    default: {}
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
      required: 'Please fill out the note'
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
      required: 'Please fill out the note'
    },
    date: {
      type: Date,
      default: null,
      trim: true
    }
  }]
});

mongoose.model('Task', TaskSchema);
