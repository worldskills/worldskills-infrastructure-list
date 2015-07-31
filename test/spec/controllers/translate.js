'use strict';

describe('Controller: TranslateCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var TranslateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TranslateCtrl = $controller('TranslateCtrl', {
      $scope: scope
    });
  }));

});
