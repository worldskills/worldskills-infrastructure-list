'use strict';

describe('Controller: SkillCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var SkillCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SkillCtrl = $controller('SkillCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
