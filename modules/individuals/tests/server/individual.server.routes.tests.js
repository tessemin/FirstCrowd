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

      done();
    });
  });

  it('should be able to get a single Individual that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Individual
          agent.post('/api/individuals')
            .send(individual)
            .expect(200)
            .end(function (individualSaveErr, individualSaveRes) {
              // Handle Individual save error
              if (individualSaveErr) {
                return done(individualSaveErr);
              }

              // Set assertions on new Individual
              (individualSaveRes.body.name).should.equal(individual.name);
              should.exist(individualSaveRes.body.user);
              should.equal(individualSaveRes.body.user._id, orphanId);

              // force the Individual to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Individual
                    agent.get('/api/individuals/' + individualSaveRes.body._id)
                      .expect(200)
                      .end(function (individualInfoErr, individualInfoRes) {
                        // Handle Individual error
                        if (individualInfoErr) {
                          return done(individualInfoErr);
                        }

                        // Set assertions
                        (individualInfoRes.body._id).should.equal(individualSaveRes.body._id);
                        (individualInfoRes.body.name).should.equal(individual.name);
                        should.equal(individualInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Individual.remove().exec(done);
    });
  });
});
