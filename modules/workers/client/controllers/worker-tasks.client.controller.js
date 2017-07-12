(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkerTasksController', WorkerTasksController);

  WorkerTasksController.$inject = ['$scope', '$state', 'WorkersService', 'Notification'];

  function WorkerTasksController ($scope, $state, WorkersService, Notification) {
    var vm = this;
    vm.tasks = [];
    vm.loaded = false;
    // Filters
    vm.clearFilters = function() {
      vm.filters = {};
    };
    vm.clearFilters();
    WorkersService.updateRecomendedTask({ '_id': 'rocks' })
      .then(function() {
      });

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

    vm.sliderOptions = {
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
          _id: vm.tasks[sliderId]._id,
          progress: vm.tasks[sliderId].progress
        };
        console.log('update: ' + JSON.stringify(update, null ,' '));

        WorkersService.updateActiveTask(update)
          .then(function(data) {
            console.log(data);
          });
      }
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
          postDate = postDate.toDateString();
          dueDate = new Date(task.deadline);
          dueDate = dueDate.toDateString();
          var clientTask = {
            '_id': task._id,
            'name': task.title,
            'category': task.category,
            'description': task.description,
            'skillsNeeded': task.skillsNeeded.join(', '),
            'postingDate': postDate,
            'deadline': dueDate,
            'status': task.status,
            'payment': {
              'bidding': {
                'bidable': task.payment.bidding.bidable,
                'startingPrice': task.payment.bidding.startingPrice
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
    };

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
          postDate = postDate.toDateString();
          dueDate = new Date(task.deadline);
          dueDate = dueDate.toDateString();
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
          } else {

          }
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
                'startingPrice': task.payment.bidding.startingPrice
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
        switch(action.id) {
          case 'apply':
            break;
          case 'bid':
            break;
          case 'take':
            console.log('take task ' + vm.tasks[index]._id);
            WorkersService.takeTask({taskId: vm.tasks[index]._id})
              .then(function(response) {
                Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Task Taken?' });
              })
              .catch(function(response) {
                Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Error! Task not taken!' });
              });
            break;
          default:
            break;
        }
        console.log('perform ' + action.id + ' on task ' + index);
      }
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
    };
    refreshProgressSliders();
  }
}());
