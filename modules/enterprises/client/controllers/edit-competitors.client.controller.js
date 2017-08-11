(function () {
  'use strict';

  // EnterpriseCompetitor controller
  angular
    .module('enterprises')
    .controller('EnterpriseCompetitorController', EnterpriseCompetitorController);

  EnterpriseCompetitorController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService', 'Notification'];

  function EnterpriseCompetitorController ($scope, $state, $window, Authentication, EnterprisesService, Notification) {
    var vm = this;
    vm.partners = [];
    vm.updatePartner = updatePartner;
    vm.deletePartner = deletePartner;

    function deletePartner(index) {
      if (vm.partners[index]._id)
        updatePartner(true, index, true);
      else
        Notification.success({ message: 'competitor deleted!', title: '<i class="glyphicon glyphicon-ok"></i> Competitors updated!' });
      vm.partners.splice(index, 1);
    }
    
    vm.addPartner = function() {
      vm.partners.push({
        URL: '',
        companyName: ''
      });
    }

    // UpdateCompetitors Enterprise
    function updatePartner(isValid, index, deleteItem) {
      if (!deleteItem)
        deleteItem = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.competitorsForm.$index');
        return false;
      }
      EnterprisesService.updateCompetitorsFromForm({
        competitor: vm.partners[index],
        delete: deleteItem
        })
        .then(function(response) {
          if (!deleteItem)
            vm.partners[index] = response.competitor;
          Notification.success({ message: response.message, title: '<i class="glyphicon glyphicon-ok"></i> Competitors updated!' });
        })
        .catch(onUpdateCompetitorsError);
    }

    function onUpdateCompetitorsError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Update failed! Competitors not updated!' });
    }

    (function createList() {
      EnterprisesService.getEnterprise()
        .then(function(response) {
          vm.partners = response.partners.competitor;
        });
    }())
  }
}());
