'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  errorHandler = require('../errors.server.controller'),
  _ = require('lodash');
  
/* var getUserTypeObject = taskTools.getUserTypeObject,
  ownsTask = taskTools.ownsTask,
  setStatus = taskTools.setStatus,
  taskFindOne = taskSearch.taskFindOne; */

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AecAzJEgQRFF8kL2hhPkyBjiNmvLLCxyQR3cCkNN4hmobtGKQBLyWpUAwUqYZK7hIJhQhRlX36X3YaAV',
  'client_secret': 'EI1O4k8WMGINV4HWteAeJsKEKGnSwnDSxxpIc4Lgzwkp0xxg2nnBDfH1QzQT-XfmZQJb5bVNPD0ALOP9'
});

var paypalWebProfileId = 'XP-BSQB-HQRX-4474-GGLT';
/* 
var create_web_profile_json = {
  'name': 'First Crowd Paypal Profile',
  'presentation': {
    'brand_name': 'First Crowd',
    //'logo_image': 'https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg',
    'locale_code': 'US'
  },
  'input_fields': {
    'allow_note': false,
    'no_shipping': 1,
    'address_override': 1
  }
}; */
  
// itmes in format:
/*
[{
  'name': 'Workers',
  'sku': task._id,
  'price': task.payment.staticPrice,
  'currency': 'USD',
  'quantity': task.multiplicity
}]
*/
module.exports.createPaypalPayment = function (items, description, callBack, returnURL, cancelURL) {
  
  var create_payment_json = {
    'intent': 'authorize',
    'payer': {
      'payment_method': 'paypal'
    },
    'redirect_urls': {
      'return_url': '/',
      'cancel_url': '/'
    },
    'transactions': [{
      'item_list': {
        'items': items
      },
      'amount': {
        'currency': 'USD',
        'total': 0
      },
      'description': description
    }]
  };
  
  var total = 0;
  items.forEach(function(item) {
    total += item.price * item.quantity;
  });
  create_payment_json.transactions[0].amount.total = total;
  
  if (returnURL)
    create_payment_json.redirect_urls.cancel_url = returnURL;
  if (cancelURL)
    create_payment_json.redirect_urls.cancel_url = cancelURL;
  
  // adds our paypal web profile so no shipping option pops up
  create_payment_json.experience_profile_id = paypalWebProfileId;
  
  paypal.payment.create(create_payment_json, function(error, createdPayment) {
    if (error) {
      callBack(error.message);
    } else {
      callBack(null, createdPayment);
    }
  });
};
module.exports.executePaypalPayment = function (payerID, paymentID, transactions, callBack) {
  var execute_payment_json = {
    'payer_id': payerID,
    'transactions': transactions
  };
  paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
    if (error) {
      callBack(error.name);
    } else {
      callBack(null, payment);
    }
  });
};
