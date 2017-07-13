//  service used to communicate Enterprises REST endpoints
(function () {
  'use strict';

  angular
    .module('enterprises')
    .factory('EnterprisesService', EnterprisesService);

  EnterprisesService.$inject = ['$resource'];

  function EnterprisesService($resource) {
    var Enterprises = $resource('/enterprises/api/enterprises/:enterpriseId', {
      enterpriseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      updateProfile: {
        method: 'POST',
        url: '/enterprises/api/enterprises/profile/'
      },
      updateSuppliers: {
        method: 'POST',
        url: '/enterprises/api/enterprises/suppliers/'
      },
      updateCompetitors: {
        method: 'POST',
        url: '/enterprises/api/enterprises/competitors/'
      },
      updateCustomers: {
        method: 'POST',
        url: '/enterprises/api/enterprises/customers/'
      },
      getEnterpriseItems: {
        method: 'GET',
        url: '/enterprises/api/enterprises/getEnterprise'
      },
      getEnterpriseDemands: {
        method: 'POST',
        url: '/enterprises/api/enterprises/getDemands'
      },
      getEnterpriseCompetitors: {
        method: 'POST',
        url: '/enterprises/api/enterprises/partners/getCompetitors'
      },
      getEnterpriseCustomers: {
        method: 'POST',
        url: '/enterprises/api/enterprises/partners/getCustomers'
      },
      getEnterpriseSuppliers: {
        method: 'POST',
        url: '/enterprises/api/enterprises/partners/getSuppliers'
      },
      getEnterpriseProducts: {
        method: 'POST',
        url: '/enterprises/api/enterprises/catalog/getProducts'
      },
      getEnterpriseServices: {
        method: 'POST',
        url: '/enterprises/api/enterprises/catalog/getServices'
      },
      setupEnterpriseGraph: {
        method: 'POST',
        url: '/enterprises/api/enterprises/setupEnterpriseGraph'
      }
    });

    angular.extend(Enterprises, {
      updateProfileFromForm: function (profile) {
        return this.updateProfile(profile).$promise;
      },
      updateSuppliersFromForm: function (suppliers) {
        return this.updateSuppliers(suppliers).$promise;
      },
      updateCustomersFromForm: function (customers) {
        return this.updateCustomers(customers).$promise;
      },
      updateCompetitorsFromForm: function (competitors) {
        return this.updateCompetitors(competitors).$promise;
      },
      getEnterprise: function () {
        return this.getEnterpriseItems().$promise;
      },
      getPartners: function (enterpriseId) {
        return this.getEnterprisePartners(enterpriseId).$promise;
      },
      setupGraph: function () {
        return this.setupEnterpriseGraph().$promise;
      },
      getDemands: function (enterpriseId) {
        return this.getEnterpriseDemands(enterpriseId).$promise;
      },
      getCompetitors: function (enterpriseId) {
        return this.getEnterpriseCompetitors(enterpriseId).$promise;
      },
      getCustomers: function (enterpriseId) {
        return this.getEnterpriseCustomers(enterpriseId).$promise;
      },
      getSuppliers: function (enterpriseId) {
        return this.getEnterpriseSuppliers(enterpriseId).$promise;
      },
      getProducts: function (enterpriseId) {
        return this.getEnterpriseProducts(enterpriseId).$promise;
      },
      getServices: function (enterpriseId) {
        return this.getEnterpriseServices(enterpriseId).$promise;
      }
    });


    return Enterprises;
  }
}());
