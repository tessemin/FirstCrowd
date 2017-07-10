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
  setStatus = taskTools.setStatus,
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
        if (err)
           return res.status(422).send(errorHandler.getErrorMessage(err));
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
            var returnObj = {
              paymentID: createdPayment.id,
              taskId: task._id,
              transactions: []
            };
            for (var trans = 0; trans < createdPayment.transactions.length; trans++)
              returnObj.transactions.push({ amount: createdPayment.transactions[trans].amount });
            return res.status(201).send(returnObj);
          }
        });
      });
    });
  },
  execute: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send({ message: errorHandler.getErrorMessage(err), title: 'Error Finding Task!' });
        
        // get the parse version of the transaction list
        req.body.transactions = JSON.parse(req.body.transactions);
        
        if (!task.payment.staticPrice * task.multiplicity === req.body.transactions[0].amount.total)
          return res.status(422).send({ message: 'Task total doesn\'t match payment total', title: 'Task Error!' });
        
        var execute_payment_json = {
          "payer_id": req.body.payerID,
          "transactions":  req.body.transactions
        };
        paypal.payment.execute(req.body.paymentID, execute_payment_json, function (error, payment) {
          if (error) {
            return res.status(422).send({ message: error.name, title: 'Error With Paypal' });
          } else {
            setStatus(task._id, 'open', typeObj, function (message) {
              if (message.error) {
                return res.status(422).send({
                  message: message.error,
                  title: 'Error setting task status!'
                });
              } else {
                return res.status(200).send({ message: task.title + ' is now open.' });
              }
            });
          }
        });
      });
    });
  }
};

function getTaskTotal(task) {
  
}
