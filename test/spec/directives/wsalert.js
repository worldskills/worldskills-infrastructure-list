'use strict';

describe('Directive: WSAlert', function () {

  // load the directive's module
  beforeEach(module('ilApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  // it('should make hidden element visible', inject(function ($compile) {
  //   element = angular.element('<-w-s-alert></-w-s-alert>');
  //   element = $compile(element)(scope);
  //   expect(element.text()).toBe('this is the WSAlert directive');
  // }));
});
