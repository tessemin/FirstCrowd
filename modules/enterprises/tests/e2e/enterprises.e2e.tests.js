'use strict';

describe('Enterprises E2E Tests:', function () {
  describe('Test Enterprises page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/enterprises');
      expect(element.all(by.repeater('enterprise in enterprises')).count()).toEqual(0);
    });
  });
});
