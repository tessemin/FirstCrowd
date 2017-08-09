(function () {
  'use strict';

  // Workers controller
  angular
    .module('requesters')
    .controller('RequesterTasksController', RequesterTasksController);

  RequesterTasksController.$inject = ['$scope', '$state', '$timeout', 'RequestersService', 'Notification', '$http'];

  function RequesterTasksController ($scope, $state, $timeout, RequestersService, Notification, $http) {
    var vm = this;
    vm.tasks = [];
    vm.loaded = false;
    vm.submission = {};
    vm.searchInput = '';

    // For activating a task
    var activateTaskId = null;

    // Filters
    vm.clearFilters = function() {
      vm.filters = {};
    };
    vm.clearFilters();
    vm.sort = 'name';
    vm.sortReversed = false;
    vm.statuses = [{
        id: 'open',
        bikeshed: 'Open'
      }, {
        id: 'taken',
        bikeshed: 'In Progress'
      }, {
        id: 'sClosed',
        bikeshed: 'Complete'
      }, {
        id: 'fClosed',
        bikeshed: 'Failed'
      }, {
        id: 'inactive',
        bikeshed: 'Inactive'
      }, {
        id: 'suspended',
        bikeshed: 'Suspended'
      }];


    function recalculateTaskActions(task) {
      task.taskActions = [];
      // If no one has ever worked on the task, allow deletion
      if (task.status === 'inactive' || (task.status === 'open' && task.jobs.length === 0)) {
        task.taskActions.push({
          id: 'delete',
          bikeshed: 'Delete Task'
        });
      }
      if (task.status === 'inactive') {
        task.taskActions.push({
          id: 'activate',
          bikeshed: 'Activate Task'
        });
      }
      if (task.status === 'open' || task.status === 'taken') {
        task.taskActions.push({
          id: 'suspend',
          bikeshed: 'Suspend Task'
        });
      }
      if (task.status === 'suspended') {
        task.taskActions.push({
          id: 'unsuspend',
          bikeshed: 'Unsuspend Task'
        });
      }
    }

    function getFrontTask(task) {
      return {
        '_id': task._id,
        'name': task.title,
        'category': task.category,
        'description': task.description,
        'skillsNeeded': task.skillsNeeded.length ? task.skillsNeeded.join(', ') : 'none',
        'postingDate': new Date(task.dateCreated),
        'deadline': new Date(task.deadline),
        'status': task.status,
        'progress': task.totalProgress,
        'taskActions': [],
        'taskRef': task,
        'bidable': task.payment.bidding.bidable,
        'bids': task.bids,
        'jobs': task.jobs,
        'multiplicity': task.multiplicity
      };
    }

    vm.loadData = function(data) {
      if (data) {
        vm.loaded = true;
        vm.tasks = [];
        var task,
          clientTask,
          postDate,
          dueDate;
        for (var i = 0; i < data.length; ++i) {
          task = data[i];
          clientTask = getFrontTask(task);
          recalculateTaskActions(clientTask);
          vm.tasks.push(clientTask);
        }
      }
    };

    vm.selectedBid = -1;
    vm.selectBid = function(index, task) {
      if (index !== vm.selectedBid) {
        vm.selectedBid = index;
      } else {
        vm.selectedBid = -1;
      }
    };

    vm.hireSelectedWorker = function() {
      // Bidable tasks need to be paid on hire
      if (vm.selectedTask.bidable) {
        initPaymentModal(vm.selectedTask);
      // Fixed-price tasks
      } else {
        var request = {
          taskId: vm.selectedTask._id,
          bidId: vm.selectedTask.bids[vm.selectedBid]._id
        };
        RequestersService.acceptPreapproval(request)
        .then(function(response) {
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Worker hired!' });
          var task = vm.tasks[getIndexFromTaskId(request.taskId)];
          task.multiplicity -= 1;
          if(task.multiplicity <= 0) {
            task.status = 'taken';
          }
          recalculateTaskActions(task);
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Hiring failed! Worker not hired!' });
        });
      }
    };

    vm.rejectSelectedBidder = function() {
      console.log(vm.selectedTask.bids[vm.selectedBid]);
      RequestersService.rejectBid({
        taskId: vm.selectedTask._id,
        bidId: vm.selectedTask.bids[vm.selectedBid]._id
      })
        .then(function(response) {
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Worker rejected!' });
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Rejection failed! Worker not rejected!' });
        });
    };

    vm.sortTasks = function(property) {
      if (vm.sort === property) {
        vm.sortReversed = !vm.sortReversed;
      } else {
        vm.sort = property;
        vm.sortReversed = false;
      }
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

    function initPaymentModal(task) {
      vm.modal = {};
      // put task info into modal
      if (task) {
        task = task.taskRef
        vm.modal.showContent = true;
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
        vm.modal.deadline = vm.selectedTask.deadline;
        vm.modal.dateCreated = vm.selectedTask.postingDate;

        // open modal for payment
        vm.openPaymentModal();
      } else {
        Notification.error({ message: 'Task index does not exist.', title: '<i class="glyphicon glyphicon-remove"></i> Cannot Find Task' });
      }
    }

    vm.submittedJobs = function() {
      if (vm.selectedTask && vm.selectedTask.jobs)
        for (var job = 0; job < vm.selectedTask.jobs.length; job++) {
          if (vm.selectedTask.jobs[job].status === 'submitted')
            return true;
        }
      return false;
    }

    vm.minutesToReadable = function(minutes) {
      var date = new Date(minutes*1000/60);
      return date.toDateString() + ' at ' + date.getHours() + ':' + (date.getMinutes() <= 9 ? '0' : '') + date.getMinutes();
    };

    vm.actOnTask = function(task, action) {
      switch (action) {
        case 'delete':
          vm.taskForDeletion = task._id;
          $('#confirmDeletion').modal();
          break;
        case 'getBidderInfo':
          RequestersService.getBidderInfo({ taskId: task._id })
            .then(function(response) {
              for (var i = 0; i < task.bids.length; ++i) {
                if (task.bids[i].worker.workerType.individual) {
                  for (var j = 0; j < response.individuals.length; ++j) {
                    if (task.bids[i].worker.workerId === response.individuals[j]._id) {
                      task.bids[i].bidDetails = response.individuals[j];
                    }
                  }
                } else {
                  for (var k = 0; k < response.enterprises.length; ++k) {
                    if (task.bids[i].worker.workerId === response.enterprises[k]._id) {
                      task.bids[i].bidDetails = response.enterprises[k];
                    }
                  }
                }
              }
            })
            .catch(function(response) {
              console.log('bidder info error' + response.data.message);
            });
          break;
        case 'activate':
          // init modal
          initPaymentModal(task);
          break;
        case 'reviewSubmission':
          vm.previouslySubmittedFiles = [];
          vm.openSubmissionReviewModal = function () {
            $('#submissionReviewModal').modal();
          };
          vm.closeSubmissionReviewModal = function () {
            $('#submissionReviewModal').modal('hide');
          };
          vm.submissionReviewDownload = function (file) {
            if (Array.isArray(file)) {
              file.forEach (function (fil) {
                vm.submissionReviewDownload(fil);
              });
              return null;
            }
            $http({
                url: '/api/requesters/task/file/download',
                method: "POST",
                data: {
                  fileName: file.name,
                  workerId: vm.submission.workerId,
                  timeStamp: file.timeStamp,
                  taskId: vm.selectedTask._id
                },
                responseType: 'blob'
            }).success(function (data, status, headers, config) {
              var blob = new Blob([data], { type: data.type });
              var fileName = headers('content-disposition');
              // this uses file-saver.js in public/lib
              saveAs(blob, fileName);
            }).error(function (data, status, headers, config) {
              Notification.error({ message: 'Unable to download the file', title: '<i class="glyphicon glyphicon-remove"></i> Download Error!' });
            });
          };
          function previousSubmissionDownloadables() {
            RequestersService.getDownloadableTaskFiles({
              taskId: vm.selectedTask._id,
              workerId: vm.submission.workerId
            })
            .then(function(response) {
              if (response.down) {
                var totalFiles = 0;
                var totalSubmissions = 0;
                vm.submittedReviewFiles = [];
                response.down.forEach(function(res) {
                  if (res.files && res.files.length > 0) {
                    totalFiles += res.files.length;
                    totalSubmissions++;
                    if (totalFiles < 15 && totalSubmissions < 5)
                      vm.submittedReviewFiles = vm.submittedReviewFiles.concat(res);
                  }
                });
                vm.submittedReviewFiles = vm.submittedReviewFiles.map(function(prev) {
                  if (prev.messages && prev.messages.submission)
                    prev.messages.submission = prev.messages.submission.replace('###', '').trim();
                  return prev;
                });
              }
            })
            .catch(function(response) {
              Notification.error({ message: '\n', title: '<i class="glyphicon glyphicon-remove"></i> Error getting previous submissions!' });
            });
          }
          vm.approveSubmission = function() {
            RequestersService.approveCompletion({
              taskId: vm.selectedTask._id,
              workerId: vm.submission.workerId,
              message: vm.submission.reviewMessage
            })
            .then(function(res){
              vm.submission = {};
              vm.closeSubmissionReviewModal();
              vm.selectedTask = res.task;
              Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-ok"></i> Submission Aproved!' });
            })
            .catch(function(res) {
              Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error aproving submission!' });
            });
          }
          vm.rejectSubmission = function() {
            RequestersService.rejectCompletion({
              taskId: vm.selectedTask._id,
              workerId: vm.submission.workerId,
              message: vm.submission.reviewMessage
            })
            .then(function(res){
              vm.submission = {};
              vm.closeSubmissionReviewModal();
              vm.selectedTask = res.task;
              Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-ok"></i> Submission Rejected!' });
            })
            .catch(function(res) {
              Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error rejecting submission!' });
            });
          }
          vm.retrySubmission = function() {
            RequestersService.retryCompletion({
              taskId: vm.selectedTask._id,
              workerId: vm.submission.workerId,
              message: vm.submission.reviewMessage
            })
            .then(function(res){
              vm.submission = {};
              vm.closeSubmissionReviewModal();
              vm.selectedTask = res.task;
              Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-ok"></i> Retry Aproved!' });
            })
            .catch(function(res) {
              Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error aproving retry!' });
            });
          }
          previousSubmissionDownloadables();
          vm.openSubmissionReviewModal();
          break;
        case 'suspend':
          RequestersService.suspendTask({
            taskId: vm.selectedTask._id,
          })
          .then(function(res){
            var clientTask = getFrontTask(res.task);
            recalculateTaskActions(clientTask);
            vm.tasks[vm.tasks.indexOf(task)] = clientTask;
            Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-ok"></i> Task Suspended!' });
          })
          .catch(function(res) {
            Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error Suspending!' });
          });
          break;
        case 'unsuspend':
          RequestersService.unsuspendTask({
            taskId: vm.selectedTask._id,
          })
          .then(function(res){
            var clientTask = getFrontTask(res.task);
            recalculateTaskActions(clientTask);
            vm.tasks[vm.tasks.indexOf(task)] = clientTask;
            Notification.success({ message: res.message, title: '<i class="glyphicon glyphicon-ok"></i> Task Unsuspended!' });
          })
          .catch(function(res) {
            Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error Unsuspended!' });
          });
          break;
        default:
          console.log('perform ' + action + ' on task ' + task._id);
      }
    };

    RequestersService.getAllTasks()
      .then(function(data) {
        vm.loadData(data.tasks);
      });

    vm.searchTasks = function() {
      RequestersService.searchMyTasks({
        query: vm.searchInput
      })
      .then(function(response){
        console.log(response);
        vm.loadData(response.results);
      })
      .catch(function(response){
        console.log(response);
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error searching tasks!' });
      });
    };

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
          var task = vm.tasks[getIndexFromTaskId(response.taskId)];
          task.status = 'open';
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task activated!' });
          activateTaskId = null;
          recalculateTaskActions(task);
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
          vm.selectedTask.status = 'taken';
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Bid approved! Task assigned!' });
        })
        .catch(function(response) {
          Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Approval failed! Task not assigned!' });
        });
    };

    vm.closePaymentModal = function () {
      $('#reviewPaymentModal').modal('hide');
    };

    // TODO: Make this angular compliant
    // paypal payment action
    (function paypalButtonRender() {
      activateTaskId = null;
      var executePayTaskId = null;
      var payTaskBidId = null;
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
          var paypi = '/api/tasks/' +
            (vm.selectedBid !== -1 ? 'bidding/' : '') +
            'payment/create';
          var request = { taskId: activateTaskId };
          if (vm.selectedBid !== -1) {
            payTaskBidId = vm.selectedTask.bids[vm.selectedBid]._id;
            request.bidId = payTaskBidId;
            console.log('bid ' + vm.selectedBid + ' id ' + request.bidId);
          }
          console.log('ppoint1');
          console.log('taskId ' + request.taskId);
          return paypal.request.post(paypi, request).then(function(data) {
            console.log('ppoint2');
            // closes the payment review modal
            vm.closePaymentModal();
            executePayTaskId = data.taskId;
            return data.paymentID;
          });
        },
        onAuthorize: function(data) {
          console.log(data);
          var paypi = '/api/tasks/' +
            (payTaskBidId !== null ? 'bidding/' : '') +
            'payment/execute';
          return paypal.request.post(paypi, {
            paymentID: data.paymentID,
            payerID: data.payerID,
            taskId: executePayTaskId,
            bidId: payTaskBidId
          }).then(function(response) {
            // payment completed success
            Notification.success({ message: response, title: '<i class="glyphicon glyphicon-ok"></i> Payment Accepted!' });
            var task = vm.tasks[getIndexFromTaskId(activateTaskId)];
            if (payTaskBidId !== null) {
              // approve worker for task
              task.multiplicity -= 1;
              if(task.multiplicity === 0) {
                task.status = 'taken';
              }
            } else {
              task.status = 'open';
            }
            recalculateTaskActions(task);
            activateTaskId = null;
          });
        },
        onError: function(err) {
          // show a gracful error
          Notification.error({ message: err.message, title: '<i class="glyphicon glyphicon-remove"></i> Error!' });
          activateTaskId = null;
        }
      }, '#paypal-button');
    }());
  }
}());
