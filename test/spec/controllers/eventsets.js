'use strict';

describe('Controller: EventSetsCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventSetsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventSetsCtrl = $controller('EventSetsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
