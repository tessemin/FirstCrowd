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
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Individual
    user.save(function () {
      individual = {
        name: 'Individual name'
      };

      done();
    });
  });

  it('should be able to save a Individual if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Individual
        agent.post('/api/individuals')
          .send(individual)
          .expect(200)
          .end(function (individualSaveErr, individualSaveRes) {
            // Handle Individual save error
            if (individualSaveErr) {
              return done(individualSaveErr);
            }

            // Get a list of Individuals
            agent.get('/api/individuals')
              .end(function (individualsGetErr, individualsGetRes) {
                // Handle Individuals save error
                if (individualsGetErr) {
                  return done(individualsGetErr);
                }

                // Get Individuals list
                var individuals = individualsGetRes.body;

                // Set assertions
                (individuals[0].user._id).should.equal(userId);
                (individuals[0].name).should.match('Individual name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Individual if not logged in', function (done) {
    agent.post('/api/individuals')
      .send(individual)
      .expect(403)
      .end(function (individualSaveErr, individualSaveRes) {
        // Call the assertion callback
        done(individualSaveErr);
      });
  });

  it('should not be able to save an Individual if no name is provided', function (done) {
    // Invalidate name field
    individual.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Individual
        agent.post('/api/individuals')
          .send(individual)
          .expect(400)
          .end(function (individualSaveErr, individualSaveRes) {
            // Set message assertion
            (individualSaveRes.body.message).should.match('Please fill Individual name');

            // Handle Individual save error
            done(individualSaveErr);
          });
      });
  });

  it('should be able to update an Individual if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Individual
        agent.post('/api/individuals')
          .send(individual)
          .expect(200)
          .end(function (individualSaveErr, individualSaveRes) {
            // Handle Individual save error
            if (individualSaveErr) {
              return done(individualSaveErr);
            }

            // Update Individual name
            individual.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Individual
            agent.put('/api/individuals/' + individualSaveRes.body._id)
              .send(individual)
              .expect(200)
              .end(function (individualUpdateErr, individualUpdateRes) {
                // Handle Individual update error
                if (individualUpdateErr) {
                  return done(individualUpdateErr);
                }

                // Set assertions
                (individualUpdateRes.body._id).should.equal(individualSaveRes.body._id);
                (individualUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Individuals if not signed in', function (done) {
    // Create new Individual model instance
    var individualObj = new Individual(individual);

    // Save the individual
    individualObj.save(function () {
      // Request Individuals
      request(app).get('/api/individuals')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Individual if not signed in', function (done) {
    // Create new Individual model instance
    var individualObj = new Individual(individual);

    // Save the Individual
    individualObj.save(function () {
      request(app).get('/api/individuals/' + individualObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', individual.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Individual with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/individuals/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Individual is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Individual which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Individual
    request(app).get('/api/individuals/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Individual with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Individual if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Individual
        agent.post('/api/individuals')
          .send(individual)
          .expect(200)
          .end(function (individualSaveErr, individualSaveRes) {
            // Handle Individual save error
            if (individualSaveErr) {
              return done(individualSaveErr);
            }

            // Delete an existing Individual
            agent.delete('/api/individuals/' + individualSaveRes.body._id)
              .send(individual)
              .expect(200)
              .end(function (individualDeleteErr, individualDeleteRes) {
                // Handle individual error error
                if (individualDeleteErr) {
                  return done(individualDeleteErr);
                }

                // Set assertions
                (individualDeleteRes.body._id).should.equal(individualSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Individual if not signed in', function (done) {
    // Set Individual user
    individual.user = user;

    // Create new Individual model instance
    var individualObj = new Individual(individual);

    // Save the Individual
    individualObj.save(function () {
      // Try deleting Individual
      request(app).delete('/api/individuals/' + individualObj._id)
        .expect(403)
        .end(function (individualDeleteErr, individualDeleteRes) {
          // Set message assertion
          (individualDeleteRes.body.message).should.match('User is not authorized');

          // Handle Individual error error
          done(individualDeleteErr);
        });

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
