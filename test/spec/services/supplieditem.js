'use strict';

describe('Service: SuppliedItem', function () {

  // load the service's module
  beforeEach(module('ilApp'));

  // instantiate service
  var SuppliedItem;
  beforeEach(inject(function (_SuppliedItem_) {
    SuppliedItem = _SuppliedItem_;
  }));

  it('should do something', function () {
    expect(!!SuppliedItem).toBe(true);
  });

});
