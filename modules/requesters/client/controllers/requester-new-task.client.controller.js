(function () {
  'use strict';

  // Individuals controller
  angular
    .module('individuals')
    .controller('RequesterNewTaskController', RequesterNewTaskController);

  RequesterNewTaskController.$inject = ['$scope', '$http', 'RequestersService', 'Notification'];

  function RequesterNewTaskController ($scope, $http, RequestersService, Notification) {
    var vm = this;

    vm.newTask = {
      preapproval: true,
      payment: {
        // has to be defined as 'false' for an ng-if to work on page load
        bidding: false
      }
    };

    function submitTask(isValid) {
      if(!isValid) {
        console.log('not valid!');
        $scope.$broadcast('show-errors-check-validity', 'vm.newTaskForm');
        Notification.error({ message: 'Check the form for errors!' });
        return false;
      }
      console.log(vm.newTask);

      RequestersService.createTask(vm.newTask)
        .then(onSubmitNewTaskSuccess)
        .catch(onSubmitNewTaskFailure);
    };

    vm.submitTask = submitTask;

    function onSubmitNewTaskSuccess(response) {
      console.log(response);
      if(typeof response != "undefined" && response.message) {
        Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-suc"></i> Success:'});
      }
    };

    function onSubmitNewTaskFailure(response) {
      if(typeof response != "undefined" && response.data) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Submission failed! Task not submitted!' });
      }
    };
  }
}());
