'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Individual = mongoose.model('Individual'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  individual;

/**
 * Individual routes tests
 */
describe('Individual CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
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
      roles: [
        'user',
        'individual'
      ],
      phone: '123456789',
      
    });

    // Save a user to the test db and create new Individual
    user.save(function () {
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
            zipCode: '62947'
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
            schoolZipCode: '62946'
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
            schoolZipCode: '62901'
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
          description: 'competency of entry-level PC computer service professionalism'
        },
        {
          certificationName: 'CMBB',
          institution: 'SIU',
          dateIssued: '01/01/2016',
          description: 'The ASQ Master Black Belt (MBB) certification is a mark of career excellence'
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

      done();
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Individual.remove().exec(done);
    });
  });
});
