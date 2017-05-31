(function () {
  'use strict';

  // Enterprises controller
  angular
    .module('enterprises')
    .controller('EnterpriseCompetitorController', EnterpriseCompetitorController);

  EnterpriseCompetitorController.$inject = ['$scope', '$state', '$window', 'Authentication', 'EnterprisesService'];

  function EnterpriseCompetitorController ($scope, $state, $window, Authentication, EnterprisesService) {
    var vm = this;

    // vm.competitor = Authentication.user.competitors;
    vm.saveCompetitor = saveCompetitor;
    vm.edit = edit;


    vm.competitor = [
      {
        companyName: 'jeff',
        URL: 'www.bawls.com'
      },
      {
        companyName: 'yuki',
        URL: 'www.pawlbs.com'
      }
    ];


    vm.selected=null;


    function edit(item){
      vm.selected=item;
    }


    // UpdateCompetitor Enterprise
    function saveCompetitor(isValid) {
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
