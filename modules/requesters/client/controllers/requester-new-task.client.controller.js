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
        $scope.$broadcast('show-errors-check-validity', 'vm.newTaskForm');
        Notification.error({ message: 'Check the form for errors!' });
        return false;
      }
      
      RequestersService.submitNewTask(vm.newTask)
        .then(onSubmitNewTaskSuccess)
        .catch(onSubmitNewTaskFailure);
    };

    function onSubmitNewTaskSuccess(response) {};

    function onSubmitNewTaskFailure(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Submission failed! Task not submitted!' });
    };
  }
}());
