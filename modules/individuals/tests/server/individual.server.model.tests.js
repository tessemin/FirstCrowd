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
      middleName: 'Mid',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password',
      userRole: {
        worker: true
      },
      phone: 123456789,
      
    });
    
    individual = new Individual({
      name: 'Individual Name',
      user: user,
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
      schools: [{
        schoolName: 'Southeaster Illinois College',
        startDate: '03/10/2014',
        endDate: '03/10/2016',
        degrees: [{
          name: 'Computer Science',
          degreeLevel: 'Associates',
          concentration: ['Algorithm Design','Data Structures']
        }],
        address: {
          schoolCountry: 'Am',
          schoolStreetAddress: '322 N College Road',
          schoolCity: 'Harrisburg',
          schoolState: 'Illinois',
          schoolZipCode: 62946
        }
      }, {
        schoolName: 'Sother Illinois University',
        startDate: '08/10/2014',
        degrees: [{
          name: 'Computer Science',
          degreeLevel: 'Associates',
          concentration: ['Algorithm Design','Data Structures']
        }],
        address: {
          schoolCountry: 'Am',
          schoolStreetAddress: '222 N University Drive',
          schoolCity: 'Carbondale',
          schoolState: 'Illinois',
          schoolZipCode: 62901
        }
      }],
      jobExperience: [{
        employer: 'Cracker Barrel',
        jobTitle: 'Server',
        description: 'Serving food, cleaning, making drinks',
        skills: ['balance', 'people skills', 'stressful situations', 'team player'],
        startDate: '02/29/2016'
      }],
      certification: [{
        certificationName: 'A+',
        institution: 'SIU',
        dateIssued: '09/25/1999',
        dateExpired: '09/25/2025',
        decription: 'competency of entry-level PC computer service professionalism'
      },
      {
        certificationName: 'CMBB',
        institution: 'SIU',
        dateIssued: '01/01/2016',
        decription: 'The ASQ Master Black Belt (MBB) certification is a mark of career excellence'
      }],
      skills: [{
        skill: {
          name: 'C++'
        },
        firstUsed: '03/1/2014',
        locationLearned: ['SIC','SIU']
      }, {
        skill: {
          name: 'Java'
        },
        firstUsed: '08/1/2016',
        locationLearned: ['SIU'],
        tools:[{
          tool: {
            name: 'calculators'
          }
        }, {
          tool: {
            name: 'computers'
          }
        }]
      }],
      specialities: [{
        speciality: {
          name: 'Artifical Intelligence'
        }
      }]
    });
    
    user.individual = individual.id;

    user.save(function() {
      individual.save(function() {
        done();
        return;
      });
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return individual.save(function(err) {
        should.not.exist(err);
        done();
        return;
      });
    });

    it('should be able to show an error when try to save an unkown sex', function(done) {
      individual.bio.sex = 'glopglorp';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with age greater than 130', function(done) {
      individual.bio.dateOfBirth = '01/01/1800';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with date of birth in wrong form', function(done) {
      individual.bio.dateOfBirth = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    /*
     * Degrees
     */
    it('should be able to show an error when try to save with degree start date in wrong form', function(done) {
      individual.schools[0].startDate = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with degree end date in wrong form', function(done) {
      individual.schools[0].endDate = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with degree end date less than start date', function(done) {
      individual.schools[0].endDate = '01/01/1999';
      individual.schools[0].startDate = '01/01/2005';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    /*
     * Job Experience
     */
    it('should be able to show an error when try to save with job experience start date in wrong form', function(done) {
      individual.jobExperience[0].startDate = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with job experience end date in wrong form', function(done) {
      individual.jobExperience[0].endDate = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with job experience end date less than start date', function(done) {
      individual.jobExperience[0].endDate = '01/01/1999';
      individual.jobExperience[0].startDate = '01/01/2005';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    /*
     * certification
     */
    it('should be able to show an error when try to save with certification date issued in wrong form', function(done) {
      individual.certification[0].dateIssued = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with certification date expired in wrong form', function(done) {
      individual.certification[0].dateExpired = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with certification date expired less than date issued', function(done) {
      individual.certification[0].dateExpired = '01/01/1999';
      individual.certification[0].dateIssued = '01/01/2005';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    /*
     * skills
     */
    it('should be able to show an error when try to save with skills first used in wrong form', function(done) {
      individual.skills[0].firstUsed = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with skills last used in wrong form', function(done) {
      individual.skills[0].lastUsed = 'garbage';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
    
    it('should be able to show an error when try to save with skills last used less than first used', function(done) {
      individual.skills[0].lastUsed = '01/01/2006';
      individual.skills[0].firstUsed = '01/01/2005';

      return individual.save(function(err) {
        should.exist(err);
        done();
        return;
      });
    });
  });

  afterEach(function(done) {
    Individual.remove().exec(function() {
      User.remove().exec(function() {
        done();
        return;
      });
    });
  });
});
