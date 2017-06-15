'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Worker = mongoose.model('Worker'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  worker;

/**
 * Worker routes tests
 */
describe('Worker CRUD tests', function () {

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

    // Save a user to the test db and create new Worker
    user.save(function () {
      worker = {
        name: 'Worker name'
      };

      done();
    });
  });

  it('should be able to save a Worker if logged in', function (done) {
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

        // Save a new Worker
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle Worker save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Get a list of Workers
            agent.get('/api/workers')
              .end(function (workersGetErr, workersGetRes) {
                // Handle Workers save error
                if (workersGetErr) {
                  return done(workersGetErr);
                }

                // Get Workers list
                var workers = workersGetRes.body;

                // Set assertions
                (workers[0].user._id).should.equal(userId);
                (workers[0].name).should.match('Worker name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Worker if not logged in', function (done) {
    agent.post('/api/workers')
      .send(worker)
      .expect(403)
      .end(function (workerSaveErr, workerSaveRes) {
        // Call the assertion callback
        done(workerSaveErr);
      });
  });

  it('should not be able to save an Worker if no name is provided', function (done) {
    // Invalidate name field
    worker.name = '';

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

        // Save a new Worker
        agent.post('/api/workers')
          .send(worker)
          .expect(400)
          .end(function (workerSaveErr, workerSaveRes) {
            // Set message assertion
            (workerSaveRes.body.message).should.match('Please fill Worker name');

            // Handle Worker save error
            done(workerSaveErr);
          });
      });
  });

  it('should be able to update an Worker if signed in', function (done) {
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

        // Save a new Worker
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle Worker save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Update Worker name
            worker.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Worker
            agent.put('/api/workers/' + workerSaveRes.body._id)
              .send(worker)
              .expect(200)
              .end(function (workerUpdateErr, workerUpdateRes) {
                // Handle Worker update error
                if (workerUpdateErr) {
                  return done(workerUpdateErr);
                }

                // Set assertions
                (workerUpdateRes.body._id).should.equal(workerSaveRes.body._id);
                (workerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Workers if not signed in', function (done) {
    // Create new Worker model instance
    var workerObj = new Worker(worker);

    // Save the worker
    workerObj.save(function () {
      // Request Workers
      request(app).get('/api/workers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Worker if not signed in', function (done) {
    // Create new Worker model instance
    var workerObj = new Worker(worker);

    // Save the Worker
    workerObj.save(function () {
      request(app).get('/api/workers/' + workerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', worker.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Worker with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/workers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Worker is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Worker which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Worker
    request(app).get('/api/workers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Worker with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Worker if signed in', function (done) {
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

        // Save a new Worker
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle Worker save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Delete an existing Worker
            agent.delete('/api/workers/' + workerSaveRes.body._id)
              .send(worker)
              .expect(200)
              .end(function (workerDeleteErr, workerDeleteRes) {
                // Handle worker error error
                if (workerDeleteErr) {
                  return done(workerDeleteErr);
                }

                // Set assertions
                (workerDeleteRes.body._id).should.equal(workerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Worker if not signed in', function (done) {
    // Set Worker user
    worker.user = user;

    // Create new Worker model instance
    var workerObj = new Worker(worker);

    // Save the Worker
    workerObj.save(function () {
      // Try deleting Worker
      request(app).delete('/api/workers/' + workerObj._id)
        .expect(403)
        .end(function (workerDeleteErr, workerDeleteRes) {
          // Set message assertion
          (workerDeleteRes.body.message).should.match('User is not authorized');

          // Handle Worker error error
          done(workerDeleteErr);
        });

    });
  });

  it('should be able to get a single Worker that has an orphaned user reference', function (done) {
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

          // Save a new Worker
          agent.post('/api/workers')
            .send(worker)
            .expect(200)
            .end(function (workerSaveErr, workerSaveRes) {
              // Handle Worker save error
              if (workerSaveErr) {
                return done(workerSaveErr);
              }

              // Set assertions on new Worker
              (workerSaveRes.body.name).should.equal(worker.name);
              should.exist(workerSaveRes.body.user);
              should.equal(workerSaveRes.body.user._id, orphanId);

              // force the Worker to have an orphaned user reference
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

                    // Get the Worker
                    agent.get('/api/workers/' + workerSaveRes.body._id)
                      .expect(200)
                      .end(function (workerInfoErr, workerInfoRes) {
                        // Handle Worker error
                        if (workerInfoErr) {
                          return done(workerInfoErr);
                        }

                        // Set assertions
                        (workerInfoRes.body._id).should.equal(workerSaveRes.body._id);
                        (workerInfoRes.body.name).should.equal(worker.name);
                        should.equal(workerInfoRes.body.user, undefined);

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
      Worker.remove().exec(done);
    });
  });
});
