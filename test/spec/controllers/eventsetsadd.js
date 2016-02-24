'use strict';

describe('Controller: EventSetsAddCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventSetsAddCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventSetsAddCtrl = $controller('EventSetsAddCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  
});
