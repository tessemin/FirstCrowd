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
  'client_secret' : 'ENCJovwdfPv5qFTv9D7X_9jJ15y2ovEtU_ldyzTgVMwTkRPg8tH1gBhVCHs63aroGK0tp2yUwDgXu8s-'
});
  
exports.paypal = {
  create: function (req, res) {
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
              'name': 'item',
              'sku': 'item',
              'price': '1.00',
              'currency': 'USD',
              'quantity': 1
            }]
          },
          'amount': {
            'currency': 'USD',
            'total': '1.00'
          },
          'description': 'This is the payment description.'
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
          console.log(createdPayment)
          return res.status(201).send({paymentId: createdPayment.id});
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
