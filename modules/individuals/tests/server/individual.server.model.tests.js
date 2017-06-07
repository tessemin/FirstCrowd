'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Individual = mongoose.model('Individual');

/**
 * Globals
 */
var user,
  individual;

/**
 * Unit tests
 */
describe('Individual Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      individual = new Individual({
        name: 'Individual Name',
        user: user
        bio: {
          dateOfBirth: '09/25/1996',
          sex: 'male',
          profession: 'sharpening sticks',
          address: {
            country: 'Am',
            streetAddress: '871 Raum Road',
            city: 'herod',
            state: 'IL',
            zipCode: 62947
          }
        },
        degrees: [{
          degreeLevel: 'Associates',
          schoolName: 'Southeaster Illinois College',
          startDate: '03/10/2014',
          endDate: '03/10/2016',
          concentration: ['Algorithm Design','Data Structures'],
          major: ['Computer Science'],
          minor: ['Math', 'Engeneering', 'Chemistry'],
          address: {
            schoolCountry: 'Am',
            schoolStreetAddress: '322 N College Road',
            schoolCity: 'Harrisburg',
            schoolState: 'Illinois',
            schoolZipCode: 62946
          }
        },
        {
          degreeLevel: 'Bachelors',
          schoolName: 'Sother Illinois University',
          startDate: '08/10/2014',
          concentration: ['Algorithm Design','Cloud Computing'],
          major: ['Computer Science', 'Math'],
          minor: ['Engeneering', 'Chemistry', 'Statistics'],
          address: {
            schoolCountry: 'Am',
            schoolStreetAddress: '222 N University Drive',
            schoolCity: 'Carbondale',
            schoolState: 'Illinois',
            schoolZipCode: 62901
          }
        }],
        jobExperience: [{
          
        }
        ]
      });
      individual.save(function() {
        done();
      }
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return individual.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      individual.name = '';

      return individual.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Individual.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
