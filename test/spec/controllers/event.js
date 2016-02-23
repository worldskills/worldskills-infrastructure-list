'use strict';

describe('Controller: EventCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventCtrl = $controller('EventCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EventCtrl.awesomeThings.length).toBe(3);
  });
});
