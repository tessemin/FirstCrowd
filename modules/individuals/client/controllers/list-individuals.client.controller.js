(function () {
  'use strict';

  angular
    .module('individuals')
    .controller('IndividualsListController', IndividualsListController);

  IndividualsListController.$inject = ['IndividualsService'];

  function IndividualsListController(IndividualsService) {
    var vm = this;

    vm.individuals = IndividualsService.query();
  }
}());
