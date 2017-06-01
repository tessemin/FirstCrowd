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
    vm.cancel = cancel;

    vm.competitor = [
      {
        _id: 8,
        companyName: 'jeff',
        URL: 'www.bawls.com'
      },
      {
        _id: 9,
        companyName: 'yuki',
        URL: 'www.pawlbs.com'
      }
    ];

    function edit(item) {
      vm.selectedId = item._id;
      vm.selectedURL = item.URL;
      vm.selectedCompany = item.companyName;
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
    }

    function onUpdateCompetitorsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Competitors not updated!' });
    }
  }
}());
