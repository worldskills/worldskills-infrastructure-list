'use strict';

describe('Filter: startFrom', function () {

  // load the filter's module
  beforeEach(module('ilApp'));

  // initialize a new instance of the filter before each test
  var startFrom;
  beforeEach(inject(function ($filter) {
    startFrom = $filter('startFrom');
  }));
  // 
  // it('should return the input prefixed with "startFrom filter:"', function () {
  //   var text = 'angularjs';
  //   expect(startFrom(text)).toBe('startFrom filter: ' + text);
  // });

});
