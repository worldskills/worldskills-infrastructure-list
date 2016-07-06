'use strict';

describe('Controller: editSuppliedItemCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var editSuppliedItemCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    editSuppliedItemCtrl = $controller('editSuppliedItemCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));


});
