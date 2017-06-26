(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('RequesterNewTaskController', RequesterNewTaskController);

  RequesterNewTaskController.$inject = ['$scope', '$http'];

  function RequesterNewTaskController ($scope, $http, $state, IndividualsService, Authentication, Notification) {
    var vm = this;

    vm.newTask = {};


    console.log(vm.newTask.name);
  }
}());
