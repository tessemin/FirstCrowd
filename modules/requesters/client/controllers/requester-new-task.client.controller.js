(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('RequesterNewTaskController', RequesterNewTaskController);

  RequesterNewTaskController.$inject = ['$scope', '$http'];

  function RequesterNewTaskController ($scope, $http, $state, IndividualsService, Authentication, Notification) {
    var vm = this;

    vm.newTask = {
      preapproval: true,
      payment: {
        // has to be defined as 'false' for an ng-if to work on page load
        bidding: false
      }
    };


    console.log(vm.newTask.name);
  }
}());
