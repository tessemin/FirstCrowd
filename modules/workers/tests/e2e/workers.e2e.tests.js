'use strict';

describe('Workers E2E Tests:', function () {
  describe('Test Workers page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/workers');
      expect(element.all(by.repeater('worker in workers')).count()).toEqual(0);
    });
  });
});
