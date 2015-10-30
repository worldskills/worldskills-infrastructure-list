'use strict';

describe('Controller: editRequestedItemCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var editRequestedItemCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    editRequestedItemCtrl = $controller('editRequestedItemCtrl', {
      $scope: scope
    });
  }));

  
});
