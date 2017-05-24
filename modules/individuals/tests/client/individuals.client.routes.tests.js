(function () {
  'use strict';

  describe('Individuals Route Tests', function () {
    // Initialize global variables
    var $scope,
      IndividualsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _IndividualsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      IndividualsService = _IndividualsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('individuals');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/individuals');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          IndividualsController,
          mockIndividual;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('individuals.view');
          $templateCache.put('modules/individuals/client/views/view-individual.client.view.html', '');

          // create mock Individual
          mockIndividual = new IndividualsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Individual Name'
          });

          // Initialize Controller
          IndividualsController = $controller('IndividualsController as vm', {
            $scope: $scope,
            individualResolve: mockIndividual
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:individualId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.individualResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            individualId: 1
          })).toEqual('/individuals/1');
        }));

        it('should attach an Individual to the controller scope', function () {
          expect($scope.vm.individual._id).toBe(mockIndividual._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/individuals/client/views/view-individual.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          IndividualsController,
          mockIndividual;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('individuals.create');
          $templateCache.put('modules/individuals/client/views/form-individual.client.view.html', '');

          // create mock Individual
          mockIndividual = new IndividualsService();

          // Initialize Controller
          IndividualsController = $controller('IndividualsController as vm', {
            $scope: $scope,
            individualResolve: mockIndividual
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.individualResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/individuals/create');
        }));

        it('should attach an Individual to the controller scope', function () {
          expect($scope.vm.individual._id).toBe(mockIndividual._id);
          expect($scope.vm.individual._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/individuals/client/views/form-individual.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          IndividualsController,
          mockIndividual;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('individuals.edit');
          $templateCache.put('modules/individuals/client/views/form-individual.client.view.html', '');

          // create mock Individual
          mockIndividual = new IndividualsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Individual Name'
          });

          // Initialize Controller
          IndividualsController = $controller('IndividualsController as vm', {
            $scope: $scope,
            individualResolve: mockIndividual
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:individualId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.individualResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            individualId: 1
          })).toEqual('/individuals/1/edit');
        }));

        it('should attach an Individual to the controller scope', function () {
          expect($scope.vm.individual._id).toBe(mockIndividual._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/individuals/client/views/form-individual.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
