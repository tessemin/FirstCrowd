'use strict';

describe('Requesters E2E Tests:', function () {
  describe('Test Requesters page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/requesters');
      expect(element.all(by.repeater('requester in requesters')).count()).toEqual(0);
    });
  });
});
