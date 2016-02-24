'use strict';

describe('Controller: EventSetsEditCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventSetsEditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventSetsEditCtrl = $controller('EventSetsEditCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
