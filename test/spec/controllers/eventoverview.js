'use strict';

describe('Controller: EventOverviewCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventOverviewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventOverviewCtrl = $controller('EventOverviewCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  
});
