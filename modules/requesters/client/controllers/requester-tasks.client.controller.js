(function () {
  'use strict';

  // Workers controller
  angular
    .module('requesters')
    .controller('RequesterTasksController', RequesterTasksController);

  RequesterTasksController.$inject = ['$scope', '$state', '$timeout', 'RequestersService'];

  function RequesterTasksController ($scope, $state, $timeout, RequestersService) {
    var vm = this;
    // Filters
    vm.filters = {};
    vm.filters.name = '';
    vm.filters.postingDate = '';
    vm.filters.deadline = '';
    vm.filters.status = '';

    vm.taskActions = [
      'Fire Worker'
    ];

    vm.tasks = [];
    vm.loaded = false;
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
          vm.tasks.push({
            '_id': task._id,
            'name': task.title,
            'postingDate': postDate,
            'deadline': dueDate,
            'status': task.status,
            'progress': task.totalProgress,
            'taskAction': 'Select Action'
          });
        }
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
      getPointerColor: function(value) {
        if (value <= 50) { // 0 - 50 red - yellow
          return 'rgb(255, ' + Math.floor(value * 4.42) + ', 30)';
        } else if (value < 100) { // 50 - 99 yellow - lightgreen
          return 'rgb(' + Math.floor(255 - ((value - 50) * 2.55)) + ', 221, 30)';
        } else { // 100% = distinct shade of green
          return 'rgb(0, 255, 30)';
        }
      },
      getSelectionBarColor: function(value) {
        if (value === 100) {
          return 'rgb(0, 221, 0)';
        } else {
          return 'rgb(128, 128, 160)';
        }
      }
    };
  }
}());
