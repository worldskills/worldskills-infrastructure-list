'use strict';

describe('Service: downloader', function () {

  // load the service's module
  beforeEach(module('ilApp'));

  // instantiate service
  var downloader;
  beforeEach(inject(function (_downloader_) {
    downloader = _downloader_;
  }));

  it('should do something', function () {
    expect(!!downloader).toBe(true);
  });

});
