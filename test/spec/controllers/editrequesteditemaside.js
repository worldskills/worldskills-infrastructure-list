'use strict';

describe('Controller: editRequestedItemAsideCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var editRequestedItemAsideCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    editRequestedItemAsideCtrl = $controller('editRequestedItemAsideCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(editRequestedItemAsideCtrl.awesomeThings.length).toBe(3);
  });
});
