'use strict';

describe('Controller: SkillCategoryCtrl', function () {

  // load the controller's module
  beforeEach(module('ilApp'));

  var SkillCategoryCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SkillCategoryCtrl = $controller('SkillCategoryCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
