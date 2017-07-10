'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  errorHandler = require('../errors.server.controller'),
  _ = require('lodash');
paypal.configure({
  'mode': 'sandbox',
  'client_id' : 'AecAzJEgQRFF8kL2hhPkyBjiNmvLLCxyQR3cCkNN4hmobtGKQBLyWpUAwUqYZK7hIJhQhRlX36X3YaAV',
  'client_secret' : 'EI1O4k8WMGINV4HWteAeJsKEKGnSwnDSxxpIc4Lgzwkp0xxg2nnBDfH1QzQT-XfmZQJb5bVNPD0ALOP9'
});
  
exports.paypal = {
  create: function (req, res) {
      var taskId = req.body.taskId;
      var create_payment_json = {
        'intent': 'sale',
        'payer': {
          'payment_method': 'paypal'
        },
        'redirect_urls': {
          'return_url': '/',
          'cancel_url': '/'
        },
        'transactions': [{
          'item_list': {
            'items': [{
              'name': 'workers',
              'sku': '',
              'price': costOfEachWorker,
              'currency': 'USD',
              'quantity': multiplicity
            }]
          },
          'amount': {
            'currency': 'USD',
            'total': totalCostOfTask
          },
          'description': taskDescription
        }]
      };
      
      
      if (req.body.returnURL)
        create_payment_json.redirect_urls.cancel_url = req.body.returnURL;
      if (req.body.cancelURL)
        create_payment_json.redirect_urls.cancel_url = req.body.cancelURL;
      
      paypal.payment.create(create_payment_json, function(error, createdPayment){
        if (error) {
          return res.status(422).send({ name: error.name, message: error.message });
        } else {
          return res.status(201).send({paymentId: createdPayment.id, taskId: taskId });
        }
      });
  },
  execute: function (req, res) {
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        return res.status(422).send({ name: error.name, message: error.message });
      } else {
        return res.status(200).send(payment);
      }
    });
  }
};
