'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  paypal = require('paypal-rest-sdk'),
  mongoose = require('mongoose'),
  taskTools = require(path.resolve('modules/requesters/server/controllers/requesters/task.tools.server.controller')),
  taskSearch = require(path.resolve('./modules/requesters/server/controllers/requesters/task.search.server.controller')),
  errorHandler = require('../errors.server.controller'),
  _ = require('lodash');
  
var getUserTypeObject = taskTools.getUserTypeObject,
  taskFindOne = taskSearch.taskFindOne;

paypal.configure({
  'mode': 'sandbox',
  'client_id' : 'AecAzJEgQRFF8kL2hhPkyBjiNmvLLCxyQR3cCkNN4hmobtGKQBLyWpUAwUqYZK7hIJhQhRlX36X3YaAV',
  'client_secret' : 'EI1O4k8WMGINV4HWteAeJsKEKGnSwnDSxxpIc4Lgzwkp0xxg2nnBDfH1QzQT-XfmZQJb5bVNPD0ALOP9'
});
  
exports.paypal = {
  create: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
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
                'name': 'Workers',
                'sku': task._id,
                'price': task.payment.staticPrice,
                'currency': 'USD',
                'quantity': task.multiplicity
              }]
            },
            'amount': {
              'currency': 'USD',
              'total': task.payment.staticPrice * task.multiplicity
            },
            'description': task.description
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
            return res.status(201).send({paymentId: createdPayment.id, taskId: task._id });
          }
        });
      });
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
