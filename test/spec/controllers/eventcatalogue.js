'use strict';

describe('Controller: EventCatalogueCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var EventcatalogueCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventCatalogueCtrl = $controller('EventCatalogueCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
