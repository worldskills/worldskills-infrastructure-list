'use strict';

describe('Service: ItemSets', function () {

  // load the service's module
  beforeEach(module('ilApp'));

  // instantiate service
  var ItemSets;
  beforeEach(inject(function (_ItemSets_) {
    ItemSets = _ItemSets_;
  }));

  it('should do something', function () {
    expect(!!ItemSets).toBe(true);
  });

});
