'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Enterprise = mongoose.model('Enterprise');

/**
 * Globals
 */
var user,
  enterprise,
  credentials;

/**
 * Unit tests
 */
describe('Enterprise Model Unit Tests:', function() {
  beforeEach(function(done) {
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };
    
    user = new User({
      firstName: 'Full',
      middleName: 'Mid',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      userRole: {
        worker: true
      },
      roles: [
        'user',
        'enterprise'
      ],
      phone: '123456789',
      contactPreference: 'phone',
      provider: 'local'
    });
    
    enterprise = new Enterprise({
        profile: {
          companyName: 'The Company',
          countryOfBusiness: 'USA',
          URL: 'web@sit.com',
          description: 'A company that sells thinga-ma-jigs, and boopit/sprockets',
          classifications: [{
            name: 'Computer Software',
            code: '11123'
          },
          {
            name: 'agriculture',
            code: '22222'
          }],
          yearEstablished: '2016',
          employeeCount: '100',
          companyAddress: {
            country: 'Germany',
            streetAddress: '625 Whaler St.',
            city: 'Rosenburg',
            state: '',
            zipCode: '445544'
          }
        },
        partners: {
          supplier: [{
            companyName: 'Nuts and bolts',
            URL: 'nuts@bolts.com'
          },
          {
            companyName: 'Dunder Mifflin Paper Co.',
            URL: 'dunder.mifflin@paper.com'
          }],
          customer: [{
            companyName: 'Cheese Factory 1',
            URL: 'cheese@domain.axa'
          }],
          competitor: [{
            companyName: 'What-cha-ma-callits',
            URL: 'ma.callits@caller.com'
          },
          {
            companyName: 'Hoodly-doos',
            URL: 'hoodle@doo.doo'
          },
          {
            companyName: 'Big Company',
            URL: 'big@co.com'
          }],
        }
    });
    
    user.enterprise = enterprise.id;
    enterprise.user = user;

    user.save(function() {
      enterprise.save(function() {
        done();
      });
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      
      delete enterprise.partners;
      delete enterprise.profile;
      
      enterprise.save(function(err) {
        should.not.exist(err);
        done();
      });
    });
    
    it('should be able to save minimal enterprise without problems', function(done) {
      this.timeout(0);
      enterprise.save(function(err) {
        should.not.exist(err);
        done();
      });
    });
    
    /*
     * Profile
     */
    it('should be able to show an error when trying to save a garbage profile URL', function(done) {
      enterprise.profile.URL = 'garbage';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when try to save a garbage yearEstablished', function(done) {
      enterprise.profile.yearEstablished = 'garbage';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when try to save yearEstablished less than zero', function(done) {
      enterprise.profile.yearEstablished = '-1';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when try to save yearEstablished greater than current year', function(done) {
      var date = new Date()
      enterprise.profile.yearEstablished = date.getFullYear() + 1;

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when try to save employeeCount less than zero', function(done) {
      enterprise.profile.employeeCount = '-1';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    /*
     * Partners
     */
     
    /*
     * supplier
     */
     
    it('should be able to show an error when trying to save a garbage supplier URL', function(done) {
      enterprise.partners.supplier[0].URL = 'garbage';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
    
    it('should be able to show an error when trying to save a supplier with no company name', function(done) {
      enterprise.partners.supplier[0].companyName = '';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
  
    /*
     * customer
     */
     
    it('should be able to show an error when trying to save a garbage customer URL', function(done) {
      enterprise.partners.customer[0].URL = 'garbage';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save a customer with no company name', function(done) {
      enterprise.partners.customer[0].companyName = '';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });

    /*
     * competitor
     */

    it('should be able to show an error when trying to save a garbage competitor URL', function(done) {
      enterprise.partners.competitor[0].URL = 'garbage';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save a competitor with no company name', function(done) {
      enterprise.partners.competitor[0].companyName = '';

      enterprise.save(function(err) {
        should.exist(err);
        done();
      });
    });
  
  });

  afterEach(function(done) {
    Enterprise.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
