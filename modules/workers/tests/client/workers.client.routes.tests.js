(function () {
  'use strict';

  describe('Workers Route Tests', function () {
    // Initialize global variables
    var $scope,
      WorkersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _WorkersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      WorkersService = _WorkersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('workers');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/workers');
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
          WorkersController,
          mockWorker;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('workers.view');
          $templateCache.put('modules/workers/client/views/view-worker.client.view.html', '');

          // create mock Worker
          mockWorker = new WorkersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Worker Name'
          });

          // Initialize Controller
          WorkersController = $controller('WorkersController as vm', {
            $scope: $scope,
            workerResolve: mockWorker
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:workerId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.workerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            workerId: 1
          })).toEqual('/workers/1');
        }));

        it('should attach an Worker to the controller scope', function () {
          expect($scope.vm.worker._id).toBe(mockWorker._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/workers/client/views/view-worker.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          WorkersController,
          mockWorker;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('workers.create');
          $templateCache.put('modules/workers/client/views/form-worker.client.view.html', '');

          // create mock Worker
          mockWorker = new WorkersService();

          // Initialize Controller
          WorkersController = $controller('WorkersController as vm', {
            $scope: $scope,
            workerResolve: mockWorker
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.workerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/workers/create');
        }));

        it('should attach an Worker to the controller scope', function () {
          expect($scope.vm.worker._id).toBe(mockWorker._id);
          expect($scope.vm.worker._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/workers/client/views/form-worker.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          WorkersController,
          mockWorker;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('workers.edit');
          $templateCache.put('modules/workers/client/views/form-worker.client.view.html', '');

          // create mock Worker
          mockWorker = new WorkersService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Worker Name'
          });

          // Initialize Controller
          WorkersController = $controller('WorkersController as vm', {
            $scope: $scope,
            workerResolve: mockWorker
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:workerId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.workerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            workerId: 1
          })).toEqual('/workers/1/edit');
        }));

        it('should attach an Worker to the controller scope', function () {
          expect($scope.vm.worker._id).toBe(mockWorker._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/workers/client/views/form-worker.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
