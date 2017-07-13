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
  ownsTask = taskTools.ownsTask,
  setStatus = taskTools.setStatus,
  taskFindOne = taskSearch.taskFindOne;

paypal.configure({
  'mode': 'sandbox',
  'client_id' : 'AecAzJEgQRFF8kL2hhPkyBjiNmvLLCxyQR3cCkNN4hmobtGKQBLyWpUAwUqYZK7hIJhQhRlX36X3YaAV',
  'client_secret' : 'EI1O4k8WMGINV4HWteAeJsKEKGnSwnDSxxpIc4Lgzwkp0xxg2nnBDfH1QzQT-XfmZQJb5bVNPD0ALOP9'
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
  
exports.paypal = {
  create: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
           return res.status(422).send(errorHandler.getErrorMessage(err));
         
        if (!ownsTask(task, typeObj))
          return res.status(422).send('You are not the owner for this task.');
        
        if (task.payment.paymentInfo.paid === true) {
          return res.status(422).send('Payment for task already received.');
        }
        
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
        
        // adds our paypal web profile so no shipping option pops up
        create_payment_json.experience_profile_id = paypalWebProfileId;
        
        paypal.payment.create(create_payment_json, function(error, createdPayment){
          if (error) {
            return res.status(422).send(error.message);
          } else {
            task.payment.paymentInfo.paymentType = 'paypal';
            task.payment.paymentInfo.paymentId = createdPayment.id;
            task.payment.paymentInfo.paymentObject = createdPayment;
            task.save(function(err, task){
              if (err)
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              return res.status(201).send({paymentID: createdPayment.id, taskId: task._id});
            });
          }
        });
      });
    });
  },
  execute: function (req, res) {
    getUserTypeObject(req, res, function(typeObj) {
      taskFindOne(req.body.taskId, function(err, task) {
        if (err)
          return res.status(422).send(errorHandler.getErrorMessage(err));
        if (task.payment.paymentInfo.paymentType === 'paypal') {
          if (!ownsTask(task, typeObj))
            return res.status(422).send('You are not the owner for this task.');
          
          if (!task.payment.paymentInfo || !task.payment.paymentInfo.paymentId)
            return res.status(422).send('No payment has been created.');
          
          var transactions = [];
          var total = 0;
          for (var trans = 0; trans < task.payment.paymentInfo.paymentObject.transactions.length; trans++) {
            transactions.push({ amount: task.payment.paymentInfo.paymentObject.transactions[trans].amount });
            total += task.payment.paymentInfo.paymentObject.transactions[trans].amount.total;
          }

          if (parseFloat(total) !== task.payment.staticPrice * task.multiplicity)
            return res.status(422).send('Payment object total does not match actual total.');
          
          var execute_payment_json = {
            "payer_id": req.body.payerID,
            "transactions":  transactions
          };
          paypal.payment.execute(req.body.paymentID, execute_payment_json, function (error, payment) {
            if (error) {
              return res.status(422).send(error.name);
            } else {
              task.payment.paymentInfo.paid = true;
              task.payment.paymentInfo.payerId = req.body.payerID;
              task.payment.paymentInfo.paymentObject = payment;
              task.save(function(err, task){
                if (err)
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                setStatus(task._id, 'open', function (message) {
                  if (message.error) {
                    return res.status(422).send({
                      message: message.error
                    });
                  } else {
                    return res.status(200).send(task.title + ' is now open.');
                  }
                });
              });
            }
          });
        } else {
          // not paypal
        }
      });
    });
  }
};

function getTaskTotal(task) {
  
}
