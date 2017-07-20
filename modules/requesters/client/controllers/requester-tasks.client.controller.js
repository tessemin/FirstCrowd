(function () {
  'use strict';

  // Workers controller
  angular
    .module('requesters')
    .controller('RequesterTasksController', RequesterTasksController);

  RequesterTasksController.$inject = ['$scope', '$state', '$timeout', 'RequestersService', 'Notification'];

  function RequesterTasksController ($scope, $state, $timeout, RequestersService, Notification) {
    var vm = this;
    vm.tasks = [];
    vm.loaded = false;

    // For activating a task
    var activateTaskId = null;

    // Filters
    vm.clearFilters = function() {
      vm.filters = {};
    };
    vm.clearFilters();
    vm.sort = 'name';
    vm.sortReversed = false;

    vm.loadData = function(data) {
      if (data) {
        vm.loaded = true;
        var task,
          taskActions,
          postDate,
          dueDate;
        for (var i = 0; i < data.tasks.length; ++i) {
          task = data.tasks[i];
          taskActions = [];
          // If no one has ever worked on the task, allow deletion
          if (task.status === 'inactive' || (task.status === 'open' && task.jobs.length === 0)) {
            taskActions.push({
              id: 'delete',
              bikeshed: 'Delete Task'
            });
          }
          if (task.status === 'inactive') {
            taskActions.push({
              id: 'activate',
              bikeshed: 'Activate Task'
            });
          }
          if (task.status === 'open') {
            taskActions.push({
              id: 'suspend',
              bikeshed: 'Suspend Task'
            });
          }
          vm.tasks.push({
            '_id': task._id,
            'name': task.title,
            'category': task.category,
            'description': task.description,
            'skillsNeeded': task.skillsNeeded.length ? task.skillsNeeded.join(', ') : 'none',
            'postingDate': new Date(task.dateCreated),
            'deadline': new Date(task.deadline),
            'status': task.status,
            'progress': task.totalProgress,
            'taskActions': taskActions,
            'taskRef': task,
            'bids': task.bids
          });
        }
      }
    };

    vm.selectedTask = -1;
    vm.toggleTask = function(index) {
      if (index !== vm.selectedTask) {
        vm.selectTask(index);
      } else {
        vm.selectedTask = -1;
      }
    };
    vm.selectTask = function(index) {
      if (index < vm.tasks.length) {
        vm.selectedTask = index;
        if (vm.tasks[index].bids.length > 0 && !vm.tasks[index].bids[0].hasOwnProperty('displayid')) {
          vm.actOnTask(index, 'getBidderInfo');
        }
      } else {
        vm.selectedTask = -1;
      }
    };

    vm.selectedBid = -1;
    vm.selectBid = function(index) {
      if (index !== vm.selectedBid) {
        vm.selectedBid = index;
      } else {
        vm.selectedBid = -1;
      }
    };

    vm.hireSelectedBidder = function() {
      RequestersService.acceptBid({
        taskId: vm.tasks[vm.selectedTask]._id,
        bidId: vm.tasks[vm.selectedTask].bids[vm.selectedBid]._id
      })
        .then(function(response) {
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Worker hired!' });
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Hire failed! Worker not hired!' });
        });
    }

    vm.sortTasks = function(property) {
      if (vm.sort === property) {
        vm.sortReversed = !vm.sortReversed;
      } else {
        vm.sort = property;
        vm.sortReversed = false;
      }
      vm.selectTask(-1);
    };

    // bootstrap modal seems difficult to work with so this is an awkward hack
    function getIndexFromTaskId(id) {
      for (var i = 0; i < vm.tasks.length; ++i) {
        if (vm.tasks[i]._id === id) {
          return i;
        }
      }
    }

    vm.cancelDeletion = function() {
      vm.taskForDeletion = -1;
    };

    vm.deleteTaskConfirmed = function() {
      console.log('delete task with _id of ' + vm.taskForDeletion);
      console.log('task is at index ' + getIndexFromTaskId(vm.taskForDeletion));
      RequestersService.deleteTask({ taskId: vm.taskForDeletion })
        .then(function(response) {
          var index = getIndexFromTaskId(vm.taskForDeletion);
          vm.tasks.splice(index, 1);
          vm.cancelDeletion();
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task deleted!' });
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Deletion failed! Task not deleted!' });
          vm.cancelDeletion();
        });
    };

    vm.actOnTask = function(index, action) {
      switch (action) {
        case 'delete':
          console.log(index);
          vm.taskForDeletion = vm.tasks[index]._id;
          $('#confirmDeletion').modal();
          break;
        case 'getBidderInfo':
          RequestersService.getBidderInfo({ taskId: vm.tasks[index]._id })
            .then(function(response) {
              for (var i = 0; i < vm.tasks[index].bids.length; ++i) {
                if (vm.tasks[index].bids[i].worker.workerType.individual) {
                  for (var j = 0; j < response.individuals.length; ++j) {
                    if (vm.tasks[index].bids[i].worker.workerId === response.individuals[j]._id) {
                      vm.tasks[index].bids[i].bidDetails = response.individuals[j];
                      console.log(vm.tasks[index].bids[i]);
                    }
                  }
                } else {
                  for (var k = 0; k < response.enterprises.length; ++k) {
                    if (vm.tasks[index].bids[i].worker.workerId === response.enterprises[k]._id) {
                      vm.tasks[index].bids[i].bidDetails = response.enterprises[k];
                    }
                  }
                }
              }
            })
            .catch(function(response) {
            });
          break;
        case 'activate':
          // init modal
          vm.modal = {};
          // put task info into modal
          if (vm.tasks[index]) {
            vm.modal.showContent = true;
            var task = vm.tasks[index].taskRef;
            if (task.payment.bidding.bidable) {
              vm.modal.bidable = true;
              vm.modal.bidding = {};
              vm.modal.bidding.maxPricePerWorker = task.payment.bidding.startingPrice;
              vm.modal.bidding.minPricePerWorker = task.payment.bidding.minPrice;
              if (task.payment.bidding.timeRange) {
                vm.modal.bidding.biddingStart = new Date(task.payment.bidding.timeRange.start);
                vm.modal.bidding.biddingEnd = new Date(task.payment.bidding.timeRange.end);
              }
            } else {
              vm.modal.bidable = false;
              vm.modal.costPerWorker = task.payment.staticPrice;
            }
            activateTaskId = task._id;
            vm.modal.title = task.title;
            vm.modal.description = task.description;
            vm.modal.preapproval = task.preapproval;
            vm.modal.secret = task.secret;
            vm.modal.skillsNeeded = task.skillsNeeded.join(', ');
            vm.modal.category = task.category;
            vm.modal.multiplicity = task.multiplicity;
            vm.modal.tax = 0.00;
            vm.modal.deadline = vm.tasks[index].deadline;
            vm.modal.dateCreated = vm.tasks[index].postingDate;

            // open modal for payment
            vm.openPaymentModal();
          } else {
            Notification.error({ message: 'Task index does not exist.', title: '<i class="glyphicon glyphicon-remove"></i> Cannot Find Task' });
          }
          break;
        default:
          console.log('perform ' + action + ' on task ' + vm.tasks[index]._id);
      }
    };

    RequestersService.getAllTasks()
      .then(function(data) {
        vm.loadData(data);
      });

    // This function is necessary to initially render the progress sliders
    (function refreshProgressSliders() {
      $scope.$broadcast('rzSliderForceRender');
      for (var i = 0; i < vm.tasks.length; ++i) { i; }
    }());

    vm.bidDetailsUrl = 'bidDetails.html';

    vm.getSliderOptions = function(id) {
      return {
        'id': id,
        floor: 0,
        ceil: 100,
        hideLimitLabels: true,
        showSelectionBar: true,
        readOnly: true,
        translate: function(value) {
          return value + '%';
        },
        getSelectionBarColor: function(value) {
          if (value === 100) {
            return 'rgb(0, 221, 0)';
          } else {
            return 'rgb(128, 128, 255)';
          }
        }
      };
    };

    // for payment modal
    vm.openPaymentModal = function () {
      $('#reviewPaymentModal').modal();
    };

    vm.activateBidableTask = function() {
      vm.closePaymentModal();
      RequestersService.activateBidable({ taskId: activateTaskId })
        .then(function(response) {
          var index = getIndexFromTaskId(response.taskId);
          vm.tasks[index].status = 'open';
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task activated!' });
          activateTaskId = null;
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Activation failed! Task not activated!' });
          activateTaskId = null;
        });
    };

    vm.approveBid = function(bidId) {
      RequestersService.activateBidable({ taskId: bidId })
        .then(function(response) {
          var index = getIndexFromTaskId(response.taskId);
          vm.tasks[index].status = 'taken';
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Bid approved! Task assigned!' });
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Approval failed! Task not assigned!' });
        });
    };

    vm.closePaymentModal = function () {
      $('#reviewPaymentModal').modal('hide');
    };

    vm.bidderPopover = {
    content: 'Bidder Information',
    title: 'Bidder Title'
  };

    // TODO: Make this angular compliant
    // paypal payment action
    (function paypalButtonRender() {
      activateTaskId = null;
      var executePayTaskId = null;
      paypal.Button.render({
        env: 'sandbox', // Or 'sandbox'
        commit: true, // Show a 'Pay Now' button
        style: {
          size: 'responsive',
          color: 'blue',
          shape: 'rect',
          label: 'pay'
        },
        payment: function() {
          return paypal.request.post('/api/payment/paypal/create/', { taskId: activateTaskId }).then(function(data) {
            // closes the payment review modal
            vm.closePaymentModal();
            executePayTaskId = data.taskId;
            return data.paymentID;
          });
        },
        onAuthorize: function(data) {
          return paypal.request.post('/api/payment/paypal/execute/', {
            paymentID: data.paymentID,
            payerID: data.payerID,
            taskId: executePayTaskId
          }).then(function(response) {
            // payment completed success
            Notification.success({ message: response, title: '<i class="glyphicon glyphicon-ok"></i> Payment Accepted!' });
            vm.tasks[getIndexFromTaskId(activateTaskId)].status = 'open';
            activateTaskId = null;
          });
        },
        onError: function(err) {
          // show a gracful error
          Notification.error({ message: err.message, title: '<i class="glyphicon glyphicon-remove"></i> Error!' });
          activateTaskId = null;
        }
      }, '#paypal-button');
    }())
  }
}());
