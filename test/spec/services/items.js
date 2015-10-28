'use strict';

describe('Service: Items', function () {

  // load the service's module
  beforeEach(module('ilApp'));

  // instantiate service
  var Items;
  beforeEach(inject(function (_Items_) {
    Items = _Items_;
  }));

  it('should do something', function () {
    expect(!!Items).toBe(true);
  });

});
