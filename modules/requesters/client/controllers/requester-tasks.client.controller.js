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

    /*
    RequestersService._getActiveTasks().$promise
      .then(function(data) {
        console.log(data);
      });
    */

    // Dummy tasks while building system
    vm.tasks = [{
      '_id': 12315327,
      'name': 'dummy task',
      'postingDate': '06/13/17',
      'deadline': '06/30/17',
      'status': 'taken',
      'progress': 50,
      'taskAction': vm.taskActions[0]
    }, {
      '_id': 12315328,
      'name': 'fix thing',
      'postingDate': '05/11/17',
      'deadline': '07/31/17',
      'status': 'taken',
      'progress': 0,
      'taskAction': vm.taskActions[0]
    }, {
      '_id': 12315329,
      'name': 'install whatzit',
      'postingDate': '06/16/17',
      'deadline': '08/15/17',
      'status': 'taken',
      'progress': 20,
      'taskAction': vm.taskActions[0]
    }];

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
