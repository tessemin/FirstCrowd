'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Requester = mongoose.model('Requester'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  requester;

/**
 * Requester routes tests
 */
describe('Requester CRUD tests', function () {

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

    // Save a user to the test db and create new Requester
    user.save(function () {
      requester = {
        name: 'Requester name'
      };

      done();
    });
  });

  it('should be able to save a Requester if logged in', function (done) {
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

        // Save a new Requester
        agent.post('/api/requesters')
          .send(requester)
          .expect(200)
          .end(function (requesterSaveErr, requesterSaveRes) {
            // Handle Requester save error
            if (requesterSaveErr) {
              return done(requesterSaveErr);
            }

            // Get a list of Requesters
            agent.get('/api/requesters')
              .end(function (requestersGetErr, requestersGetRes) {
                // Handle Requesters save error
                if (requestersGetErr) {
                  return done(requestersGetErr);
                }

                // Get Requesters list
                var requesters = requestersGetRes.body;

                // Set assertions
                (requesters[0].user._id).should.equal(userId);
                (requesters[0].name).should.match('Requester name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Requester if not logged in', function (done) {
    agent.post('/api/requesters')
      .send(requester)
      .expect(403)
      .end(function (requesterSaveErr, requesterSaveRes) {
        // Call the assertion callback
        done(requesterSaveErr);
      });
  });

  it('should not be able to save an Requester if no name is provided', function (done) {
    // Invalidate name field
    requester.name = '';

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

        // Save a new Requester
        agent.post('/api/requesters')
          .send(requester)
          .expect(400)
          .end(function (requesterSaveErr, requesterSaveRes) {
            // Set message assertion
            (requesterSaveRes.body.message).should.match('Please fill Requester name');

            // Handle Requester save error
            done(requesterSaveErr);
          });
      });
  });

  it('should be able to update an Requester if signed in', function (done) {
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

        // Save a new Requester
        agent.post('/api/requesters')
          .send(requester)
          .expect(200)
          .end(function (requesterSaveErr, requesterSaveRes) {
            // Handle Requester save error
            if (requesterSaveErr) {
              return done(requesterSaveErr);
            }

            // Update Requester name
            requester.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Requester
            agent.put('/api/requesters/' + requesterSaveRes.body._id)
              .send(requester)
              .expect(200)
              .end(function (requesterUpdateErr, requesterUpdateRes) {
                // Handle Requester update error
                if (requesterUpdateErr) {
                  return done(requesterUpdateErr);
                }

                // Set assertions
                (requesterUpdateRes.body._id).should.equal(requesterSaveRes.body._id);
                (requesterUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Requesters if not signed in', function (done) {
    // Create new Requester model instance
    var requesterObj = new Requester(requester);

    // Save the requester
    requesterObj.save(function () {
      // Request Requesters
      request(app).get('/api/requesters')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Requester if not signed in', function (done) {
    // Create new Requester model instance
    var requesterObj = new Requester(requester);

    // Save the Requester
    requesterObj.save(function () {
      request(app).get('/api/requesters/' + requesterObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', requester.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Requester with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/requesters/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Requester is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Requester which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Requester
    request(app).get('/api/requesters/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Requester with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Requester if signed in', function (done) {
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

        // Save a new Requester
        agent.post('/api/requesters')
          .send(requester)
          .expect(200)
          .end(function (requesterSaveErr, requesterSaveRes) {
            // Handle Requester save error
            if (requesterSaveErr) {
              return done(requesterSaveErr);
            }

            // Delete an existing Requester
            agent.delete('/api/requesters/' + requesterSaveRes.body._id)
              .send(requester)
              .expect(200)
              .end(function (requesterDeleteErr, requesterDeleteRes) {
                // Handle requester error error
                if (requesterDeleteErr) {
                  return done(requesterDeleteErr);
                }

                // Set assertions
                (requesterDeleteRes.body._id).should.equal(requesterSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Requester if not signed in', function (done) {
    // Set Requester user
    requester.user = user;

    // Create new Requester model instance
    var requesterObj = new Requester(requester);

    // Save the Requester
    requesterObj.save(function () {
      // Try deleting Requester
      request(app).delete('/api/requesters/' + requesterObj._id)
        .expect(403)
        .end(function (requesterDeleteErr, requesterDeleteRes) {
          // Set message assertion
          (requesterDeleteRes.body.message).should.match('User is not authorized');

          // Handle Requester error error
          done(requesterDeleteErr);
        });

    });
  });

  it('should be able to get a single Requester that has an orphaned user reference', function (done) {
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

          // Save a new Requester
          agent.post('/api/requesters')
            .send(requester)
            .expect(200)
            .end(function (requesterSaveErr, requesterSaveRes) {
              // Handle Requester save error
              if (requesterSaveErr) {
                return done(requesterSaveErr);
              }

              // Set assertions on new Requester
              (requesterSaveRes.body.name).should.equal(requester.name);
              should.exist(requesterSaveRes.body.user);
              should.equal(requesterSaveRes.body.user._id, orphanId);

              // force the Requester to have an orphaned user reference
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

                    // Get the Requester
                    agent.get('/api/requesters/' + requesterSaveRes.body._id)
                      .expect(200)
                      .end(function (requesterInfoErr, requesterInfoRes) {
                        // Handle Requester error
                        if (requesterInfoErr) {
                          return done(requesterInfoErr);
                        }

                        // Set assertions
                        (requesterInfoRes.body._id).should.equal(requesterSaveRes.body._id);
                        (requesterInfoRes.body.name).should.equal(requester.name);
                        should.equal(requesterInfoRes.body.user, undefined);

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
      Requester.remove().exec(done);
    });
  });
});
