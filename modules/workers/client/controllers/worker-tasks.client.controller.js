(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkerTasksController', WorkerTasksController);

  WorkerTasksController.$inject = ['$scope', '$state', 'WorkersService', 'Notification', 'Upload', '$timeout', '$http'];

  function WorkerTasksController ($scope, $state, WorkersService, Notification, Upload, $timeout, $http) {
    var vm = this;
    vm.tasks = [];
    vm.loaded = false;

    // Sort
    vm.sort = 'name';
    vm.sortReversed = false;
    vm.sortTasks = function(property) {
      if (vm.sort === property) {
        vm.sortReversed = !vm.sortReversed;
      } else {
        vm.sort = property;
        vm.sortReversed = false;
      }
      vm.selectTask(-1);
    };

    // Filters
    vm.clearFilters = function() {
      vm.filters = {};
    }
    vm.clearFilters();

    vm.taskCategories = [
      {
        id: 'active',
        bikeshed: 'My active tasks'
      }, {
        id: 'open',
        bikeshed: 'Available tasks'
      }, {
        id: 'recommended',
        bikeshed: 'Recommended tasks'
      }, {
        id: 'completed',
        bikeshed: 'My completed tasks'
      }, {
        id: 'uncompleted',
        bikeshed: 'My uncompleted tasks'
      }
    ];
    vm.taskCategory = vm.taskCategories[0];

    vm.getSliderOptions = function(id) {
      return {
        'id': id,
        floor: 0,
        ceil: 100,
        hideLimitLabels: true,
        showSelectionBar: true,
        translate: function(value) {
          return value + '%';
        },
        getPointerColor: function(value) {
          if (value <= 50) { // 0 - 50 red - yellow
            return 'rgb(255, ' + Math.floor(value * 5.1) + ', 60)';
          } else if (value < 100) { // 50 - 99 yellow - lightgreen
            return 'rgb(' + Math.floor(255 - ((value - 50) * 5.1)) + ', 255, 60)';
          } else { // 100% = distinct shade of green
            return 'rgb(0, 255, 30)';
          }
        },
        getSelectionBarColor: function(value) {
          if (value === 100) {
            return '#00cc00';
          } else {
            return '#0db9f0';
          }
        },
        // Update progress on backend after changing progress slider of task
        onEnd: function(sliderId, modelValue, highValue, pointerType) {
          console.log('sliderId: ' + sliderId);
          console.log('onEnd: ' + modelValue);
          var update = {
            taskId: vm.tasks[sliderId]._id,
            progress: vm.tasks[sliderId].progress
          };
          console.log('update: ' + JSON.stringify(update, null, ' '));

          WorkersService.updateActiveTask(update)
            .then(function(data) {
              console.log(data);
            });
        }
      };
    };

    vm.loadData = function(data) {
      console.log(data);
      if (data) {
        vm.loaded = true;
        var task,
          postDate,
          dueDate;
        for (var i = 0; i < data.tasks.length; ++i) {
          task = data.tasks[i];
          postDate = new Date(task.dateCreated);
          dueDate = new Date(task.deadline);
          var taskActions = [];
          switch (vm.taskCategory.id) {
            case 'active':
              taskActions.push({
                id: 'submit',
                bikeshed: 'Submit Completed Work'
              });
              break;
          }
          var clientTask = {
            '_id': task._id,
            'name': task.title,
            'category': task.category,
            'description': task.description,
            'skillsNeeded': task.skillsNeeded.join(', '),
            'postingDate': postDate,
            'deadline': dueDate,
            'status': task.status,
            'taskActions': taskActions,
            'payment': {
              'bidding': {
                'bidable': task.payment.bidding.bidable,
                'startingPrice': task.payment.bidding.startingPrice,
                'myBid': 0
              },
              'staticPrice': task.payment.staticPrice
            }
          };

          if (task.jobs.length > 0) {
            clientTask.progress = task.jobs[0].progress;
          } else {
            clientTask.progress = 0;
          }
          vm.tasks.push(clientTask);
        }
      }
    };

    function workerIsEligible(task) {
      return true;
    }

    vm.loadOpenTasks = function(data) {
      console.log(data);
      if (data) {
        vm.loaded = true;
        var task,
          taskActions,
          postDate,
          dueDate;
        for (var i = 0; i < data.tasks.length; ++i) {
          task = data.tasks[i];
          postDate = new Date(task.dateCreated);
          postDate = postDate;
          dueDate = new Date(task.deadline);
          dueDate = dueDate;
          taskActions = [];
          if (workerIsEligible(task)) {
            if (task.payment.bidding.bidable) {
              taskActions.push({
                id: 'bid',
                bikeshed: 'Bid on Task'
              });
            } else if (task.preapproval) {
              taskActions.push({
                id: 'apply',
                bikeshed: 'Apply for Task'
              });
            } else {
              taskActions.push({
                id: 'take',
                bikeshed: 'Accept Task'
              });
            }
          } // else {
          var clientTask = {
            '_id': task._id,
            'name': task.title,
            'category': task.category,
            'description': task.description,
            'skillsNeeded': task.skillsNeeded.length ? task.skillsNeeded.join(', ') : 'none',
            'postingDate': postDate,
            'deadline': dueDate,
            'status': task.status,
            'taskActions': taskActions,
            'payment': {
              'bidding': {
                'bidable': task.payment.bidding.bidable,
                'startingPrice': task.payment.bidding.startingPrice,
                'myBid': task.payment.bidding.startingPrice
              },
              'staticPrice': task.payment.staticPrice
            }
          };

          if (task.jobs.length > 0) {
            clientTask.progress = task.jobs[0].progress;
          } else {
            clientTask.progress = 0;
          }
          vm.tasks.push(clientTask);
        }
      }
    };

    vm.changeTaskCategory = function() {
      vm.tasks = [];
      vm.loaded = false;
      vm.selectedTask = -1;
      switch (vm.taskCategory.id) {
        case 'completed':
          WorkersService.getCompletedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'uncompleted':
          WorkersService.getRejectedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'recommended':
          WorkersService.getRecomendedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'open':
          WorkersService.getAllOpenTasks()
            .then(function(data) {
              vm.loadOpenTasks(data);
            });
          break;
        case 'active':
        default:
          WorkersService.getActiveTasks()
            .then(function(data) {
              vm.loadData(data);
            });
      }
    };
    vm.changeTaskCategory();

    vm.actOnTask = function(index, action) {
      if (index < vm.tasks.length) {
        console.log(action.id);
        switch (action.id) {
          case 'apply':
            WorkersService.takeTask({
              taskId: vm.tasks[index]._id
            })
              .then(function(response) {
                Notification.success({ message: response.messsage, title: '<i class="glyphicon glyphicon-ok"></i> Application submitted!' });
              })
              .catch(function(response) {
                console.log(response);
                Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Error! Application not submitted!' });
              });
            break;
          case 'bid':
            console.log('bid $' + vm.tasks[index].payment.bidding.myBid + ' task ' + vm.tasks[index]._id);
            WorkersService.takeTask({
              taskId: vm.tasks[index]._id,
              bid: vm.tasks[index].payment.bidding.myBid
            })
              .then(function(response) {
                Notification.success({ message: response.messsage, title: '<i class="glyphicon glyphicon-ok"></i> Bid submitted!' });
              })
              .catch(function(response) {
                console.log(response);
                Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Error! Bid not submitted!' });
              });
            break;
          case 'take':
            console.log('take task ' + vm.tasks[index]._id);
            WorkersService.takeTask({
              taskId: vm.tasks[index]._id
            })
              .then(function(response) {
                vm.tasks.splice(index, 1);
                Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task Taken!' });
              })
              .catch(function(response) {
                Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Error! Task not taken!' });
              });
            break;
          case 'submit':
            vm.submittedFiles = null;
            vm.submissionProgress = 0;
            vm.previouslySubmittedFiles = [];
            vm.submissionMessage = '';
            vm.openSubmissionModal = function () {
              $('#submissionModal').modal();
            };
            vm.closeSubmissionModal = function () {
              $('#submissionModal').modal('hide');
            };
            vm.previousSubmissionDownload = function previousSubmissionDownload(file) {
              if (Array.isArray(file)) {
                file.forEach (function (fil) {
                  vm.previousSubmissionDownload(fil);
                });
                return null;
              }
              $http({
                  url: '/api/workers/task/file/download',
                  method: "POST",
                  data: {
                    fileName: file.name,
                    timeStamp: file.timeStamp,
                    taskId: vm.tasks[vm.selectedTask]._id
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
              WorkersService.getDownloadableTaskFiles({
                taskId: vm.tasks[vm.selectedTask]._id
              })
              .then(function(response) {
                if (response.down) {
                  var totalFiles = 0;
                  var totalSubmissions = 0;
                  vm.previouslySubmittedFiles = [];
                  response.down.forEach(function(res) {
                    if (res.files && res.files.length > 0) {
                      totalFiles += res.files.length;
                      totalSubmissions++;
                      if (totalFiles < 15 && totalSubmissions < 5)
                        vm.previouslySubmittedFiles = vm.previouslySubmittedFiles.concat(res);
                    }
                  });
                  vm.previouslySubmittedFiles = vm.previouslySubmittedFiles.map(function(prev) {
                    if (prev.messages && prev.messages.worker)
                      prev.messages.worker = prev.messages.worker.replace(/###\d+###/, '').trim();
                    return prev;
                  });
                }
              })
              .catch(function(response) {
                Notification.error({ message: '\n', title: '<i class="glyphicon glyphicon-remove"></i> Error getting previous submissions!' });
              });
            }
            vm.submissionConfirmed = function(files) {
              var task = vm.tasks[vm.selectedTask];
              if (files && files.length) {
                Upload.upload({
                  url: '/api/workers/task/file/submit',
                  method: 'POST',
                  file: files,
                  data: {
                    taskId: task._id,
                    message: vm.submissionMessage
                  }
                }).then(function (response) {
                  $timeout(function () {
                    vm.closeSubmissionModal();
                    Notification.success({ message: response.data.message, title: '<i class="glyphicon glyphicon-ok"></i> Submitted!' });
                  });
                }, function (response) {
                  if (response.status > 0) {
                    vm.closeSubmissionModal();
                    Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Error Submitting!' });
                  }
                }, function (evt) {
                  vm.submissionProgress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
                });
              }
              /* if (vm.submissionMessage) {
                $http({
                  url: '/api/workers/task/file/sendMessage',
                  method: "POST",
                  data: {
                    taskId: vm.tasks[vm.selectedTask]._id,
                    message: vm.submissionMessage
                  },
                }).success(function (response) {
                  Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Submitted!' });
                }).error(function (response) {
                  
                  Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Message Error!' });
                }); 
              } */
            };
            previousSubmissionDownloadables();
            vm.openSubmissionModal();
            break;
          default:
            break;
        }
        console.log('perform ' + action.id + ' on task ' + index);
      }
    };
    
    vm.minutesToReadable = function(minutes) {
      var date = new Date(minutes*1000/60);
      return date.toDateString() + ' at ' + date.getHours() + ':' + (date.getMinutes() <= 9 ? '0' : '') + date.getMinutes();
    };
    
    vm.selectedTask = -1;
    vm.selectTask = function(index) {
      if (index === vm.selectedTask) {
        vm.selectedTask = -1;
      } else if (index < vm.tasks.length) {
        vm.selectedTask = index;
      }
    };

    // This function is necessary to initially render the progress sliders
    function refreshProgressSliders() {
      $scope.$broadcast('rzSliderForceRender');
    }
    refreshProgressSliders();

  }
}());
