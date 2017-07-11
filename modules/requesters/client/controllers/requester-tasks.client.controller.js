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
    // Filters
    vm.filters = {};
    vm.clearFilters = function() {
      vm.filters.name = '';
      vm.filters.postingDate = '';
      vm.filters.deadline = '';
      vm.filters.status = '';
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
          if (task.status === 'open') {
            taskActions.push({
              id: 'suspend',
              bikeshed: 'Suspend Task'
            });
          }
          if (task.status === 'inactive') {
            taskActions.push({
              id: 'activate',
              bikeshed: 'Activate Task'
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
            'taskRef': task
          });
        }
      }
      console.log(vm.tasks);
    };

    vm.selectedTask = -1;
    vm.selectTask = function(index) {
      if (index < vm.tasks.length && index !== vm.selectedTask) {
        vm.selectedTask = index;
      } else {
        vm.selectedTask = -1;
      }
    };

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
    };

    vm.cancelDeletion = function() {
      vm.taskForDeletion = -1;
    }
    vm.cancelDeletion();

    vm.deleteTaskConfirmed = function() {
      console.log('delete task with _id of ' + vm.taskForDeletion);
      console.log('task is at index ' + getIndexFromTaskId(vm.taskForDeletion));
      /*RequestersService.deleteTask({taskId: vm.taskForDeletion})
        .then(function(response) {
          var index = getIndexFromTaskId(vm.taskForDeletion);
          vm.tasks.splice(index, 1);
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task deleted!' });
          vm.taskForDeletion = -1;
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Deletion failed! Task not deleted!' });
          vm.taskForDeletion = -1;
        });*/
    }

    vm.actOnTask = function(index, action) {
        switch(action) {
          case 'delete':
            console.log(index);
            vm.taskForDeletion = vm.tasks[index]._id;
            $('#confirmDeletion').modal();
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
                vm.modal.bidding = {}
                vm.modal.bidding.maxPricePerWorker = task.payment.bidding.startingPrice;
                vm.modal.bidding.minPricePerWorker = task.payment.bidding.minPrice;
                if (task.payment.bidding.timeRange) {
                  vm.modal.bidding.biddingStart = new Date(task.payment.bidding.timeRange.start);
                  vm.modal.bidding.biddingEnd = new Date(task.payment.bidding.timeRange.end);
                }
              } else {
                vm.modal.bidable = false;
                vm.modal.costPerWorker = task.payment.staticPrice;
                payForTaskId = task._id;
              }
              console.log(task)
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
            console.log('perform ' + action + ' on task ' + id);
        }
    };

    RequestersService.getAllTasks()
      .then(function(data) {
        vm.loadData(data);
      });

    // This function is necessary to initially render the progress sliders
    (function refreshProgressSliders() {
      $scope.$broadcast('rzSliderForceRender');
      for(var i = 0; i < vm.tasks.length; ++i) {
      }
    })();

    vm.sliderOptions = {
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
          return 'rgb(128, 128, 160)';
        }
      }
    };

    // for payment modal
    vm.openPaymentModal = function () {
       $('#reviewPaymentModal').modal();
    };

    vm.closePaymentModal = function () {
      $('#reviewPaymentModal').modal('hide');
    }

    // TODO: Make this angular compliant
    // paypal payment action
    var payForTaskId = null;
    paypal.Button.render({
      env: 'sandbox', // Or 'sandbox'

      commit: true, // Show a 'Pay Now' button
      click: function () {
        vm.closePaymentModal();
      },
      payment: function() {
        return paypal.request.post('/api/payment/paypal/create/', { taskId: payForTaskId }).then(function(data) {
          return data.paymentId;
        });
      },
      onAuthorize: function(data) {
        return paypal.request.post('/api/payment/paypal/execute/', {
          paymentID: data.paymentID,
          payerID: data.payerID
        }).then(function() {
          // payment is complete!!!
        });
      }
    }, '#paypal-button');

  }
}());
