(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseGraphController', EnterpriseGraphController);

  EnterpriseGraphController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseGraphController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;

    vm.text = 'Graph';

    // vm.selected = {};
    // vm.selectedURL = null;
    // vm.selectedCompany = null;
    // vm.selectedId = null;

    // vm.saveGraph = saveGraph;
    // vm.edit = edit;
    // vm.delete = deleteItem;
    // vm.cancel = cancel;

    // createList();

    // function edit(item) {
    //   vm.company = item.companyName;
    //   vm.selectedId = item._id;
    //   vm.selectedURL = item.URL;
    //   vm.selectedCompany = item.companyName;
    // }

    // function deleteItem(item) {
    //   item.companyName = '';
    //   item.URL = '';

    //   EnterprisesService.updateGraphsFromForm(item)
    //     .then(onUpdateGraphsSuccess)
    //     .catch(onUpdateGraphsError);
    // }

    // function cancel() {
    //   vm.selectedId = null;
    //   vm.selectedURL = null;
    //   vm.selectedCompany = null;
    // }

    // // UpdateGraph Enterprise
    // function saveGraph(isValid) {

    //   vm.selected._id = vm.selectedId;
    //   vm.selected.URL = vm.selectedURL;
    //   vm.selected.companyName = vm.selectedCompany;

    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.competitorForm');
    //     return false;
    //   }

    //   EnterprisesService.updateGraphsFromForm(vm.selected)
    //     .then(onUpdateGraphsSuccess)
    //     .catch(onUpdateGraphsError);
    // }

    // function onUpdateGraphsSuccess(response) {
    //   Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Graphs updated!' });
    //   createList();
    //   cancel();
    // }

    // function onUpdateGraphsError(response) {
    //   Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Graphs not updated!' });
    //   createList();
    // }

    // function createList() {
    //   EnterprisesService.getEnterprise()
    //     .then(function(response) {
    //       vm.competitor = response.partners.competitor;
    //     });
    // }
  }
}());
