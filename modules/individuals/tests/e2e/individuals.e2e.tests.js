'use strict';

describe('Individuals E2E Tests:', function () {
  describe('Test Individuals page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/individuals');
      expect(element.all(by.repeater('individual in individuals')).count()).toEqual(0);
    });
  });
});
