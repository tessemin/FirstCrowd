'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
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
