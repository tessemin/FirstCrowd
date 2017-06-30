(function () {
  'use strict';

  // Workers controller
  angular
    .module('workers')
    .controller('WorkerTasksController', WorkerTasksController);

  WorkerTasksController.$inject = ['$scope', '$state', 'WorkersService'];

  function WorkerTasksController ($scope, $state, WorkersService) {
    var vm = this;
    vm.loaded = false;
    // Filters
    vm.filters = {};
    vm.filters.name = '';
    vm.filters.postingDate = '';
    vm.filters.deadline = '';
    vm.filters.status = '';

    vm.taskActions = [
      'Select Action',
      'Quit Task',
      'Submit Results'
    ];

    vm.tasks = [];

    WorkersService.updateRecomendedTask({ '_id': 'rocks' })
      .then(function() {
      });

    vm.taskCategories = [
      'Active Tasks',
      'Completed Tasks',
      'Uncompleted Tasks',
      'Open Tasks',
      'Recommended Tasks'
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
        vm.tasks = [];
        var task,
          postDate,
          dueDate;
        for (var i = 0; i < data.tasks.length; ++i) {
          task = data.tasks[i];
          postDate = new Date(task.dateCreated);
          postDate = postDate.toDateString();
          dueDate = new Date(task.deadline);
          dueDate = dueDate.toDateString();
          vm.tasks.push({
            '_id': task._id,
            'name': task.title,
            'postingDate': postDate,
            'deadline': dueDate,
            'status': task.status,
            'progress': task.workers[0].progress,
            'taskAction': 'Select Action'
          });
        }
      }
    };

    vm.changeTaskCategory = function() {
      vm.loaded = false;
      switch (vm.taskCategory) {
        case 'Completed Tasks':
          WorkersService.getCompletedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'Uncompleted tasks':
          WorkersService.getRejectedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'Recommended Tasks':
          WorkersService.getRecomendedTasks()
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'Open Tasks':
          WorkersService.getTasksWithOptions({'status': 'open'})
            .then(function(data) {
              vm.loadData(data);
            });
          break;
        case 'Active Tasks':
        default:
          WorkersService.getActiveTasks()
            .then(function(data) {
              vm.loadData(data);
            });
      }
    };

    vm.changeTaskCategory();

    // This function is necessary to initially render the progress sliders
    function refreshProgressSliders() {
      $scope.$broadcast('rzSliderForceRender');
    };
    refreshProgressSliders();
  }
}());
