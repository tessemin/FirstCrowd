(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseCompetitorController', EnterpriseCompetitorController);

  EnterpriseCompetitorController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseCompetitorController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;

    vm.selected = {};
    vm.selectedURL = null;
    vm.selectedCompany = null;
    vm.selectedId = null;

    vm.saveCompetitor = saveCompetitor;
    vm.edit = edit;
    vm.deleteItem = deleteItem;
    vm.cancel = cancel;

    createList();

    function edit(item) {
      vm.company = item.companyName;
      vm.selectedId = item._id;
      vm.selectedURL = item.URL;
      vm.selectedCompany = item.companyName;
    }

    function deleteItem(item) {
      item.companyName = '';
      item.URL = '';

      console.log(item);

      EnterprisesService.updateCompetitorsFromForm(item)
        .then(onUpdateCompetitorsSuccess)
        .catch(onUpdateCompetitorsError);
    }

    function cancel() {
      vm.selectedId = null;
      vm.selectedURL = null;
      vm.selectedCompany = null;
    }

    // UpdateCompetitor Enterprise
    function saveCompetitor(isValid) {

      vm.selected._id = vm.selectedId;
      vm.selected.URL = vm.selectedURL;
      vm.selected.companyName = vm.selectedCompany;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.competitorForm');
        return false;
      }

      EnterprisesService.updateCompetitorsFromForm(vm.selected)
        .then(onUpdateCompetitorsSuccess)
        .catch(onUpdateCompetitorsError);
    }

    function onUpdateCompetitorsSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Competitors updated!' });
      createList();
      cancel();
    }

    function onUpdateCompetitorsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Competitors not updated!' });
      createList();
    }

    function createList() {
      EnterprisesService.getEnterprise()
        .then(function(response) {
          vm.competitor = response.partners.competitor;
        });
    }
  }
}());
