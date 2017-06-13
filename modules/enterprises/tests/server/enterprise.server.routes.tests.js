'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Enterprise = mongoose.model('Enterprise'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  enterprise;

/**
 * Enterprise routes tests
 */
describe('Enterprise CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
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
    enterprise.user = user.id;

    // Save a user to the test db and create new Enterprise
    user.save(function (err) {
      if (err) {
        console.log(err)
      }
      enterprise.save(function(err) {
        if (err) {
          console.log(err)
        }
        done();
      });
    });
  });
  
  /*
   * Get Enterprise
   */
  it('should be able to get the enterprise information if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        
        // Get this Enterprise
        agent.get('/enterprises/api/enterprises/getEnterprise')
          .end(function (enterprisesGetErr, enterprisesGetRes) {
            // Handle Enterprises save error
            if (enterprisesGetErr) {
              return done(enterprisesGetErr);
            }

            // Get Enterprise from res
            var resEnterprise = enterprisesGetRes.body;

            // Set assertions
            // pulled from get enteprrise
            (resEnterprise.profile).should.have.properties(['companyName', 'URL', 'countryOfBusiness', 'description', 'classifications', 'yearEstablished', 'employeeCount', 'companyAddress']);
            resEnterprise.should.have.property('partners');
            resEnterprise.should.not.have.property('user');

            // Call the assertion callback
            done();
          });
        
      })
  });
  
  it.only('should not be able to get the enterprise information if not logged in', function (done) {
    agent.get('/enterprises/api/enterprises/getEnterprise')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        (res.body).should.eql({});
        return done();
      });
  });
  
  /*
   * Profile
   */
  it('should be able to uppdate profile if logged in', function (done) {
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
        
        var profile = { 
          profile: {
            companyName: 'Test Company Name',
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
          }
        }

        // Save a new profile
        agent.post('/enterprises/api/enterprises/profile/')
          .send(profile)
          .expect(200)
          .end(function (enterpriseSaveErr, enterpriseSaveRes) {
            // Handle Enterprise save error
            if (enterpriseSaveErr) {
              return done(enterpriseSaveErr);
            }
            
            // Get this Enterprise
            agent.get('/enterprises/api/enterprises/getEnterprise/')
              .end(function (enterprisesGetErr, enterprisesGetRes) {
                // Handle Enterprises save error
                if (enterprisesGetErr) {
                  return done(enterprisesGetErr);
                }

                // Get Enterprise from res
                var enterprise = enterprisesGetRes.body;

                // Set assertions
                (enterprise.profile.companyName).should.match('Test Company Name');

                // Call the assertion callback
                done();
              });
          });
      });
  });
  
  it('should not be able to save entperise profile if not signed in', function (done) {
    
    var profile = { 
      profile: {
        companyName: 'Test Company Name',
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
      }
    }
    // Save a new Enterprise
    agent.post('/enterprises/api/enterprises/profile/')
      .send(enterprise)
      .expect(400)
      .end(function () {
        done();
      });
  });

  it('should not be able to save an Enterprise if no name is provided', function (done) {
    // Invalidate name field
    enterprise.name = '';

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

        // Save a new Enterprise
        agent.post('/api/enterprises')
          .send(enterprise)
          .expect(400)
          .end(function (enterpriseSaveErr, enterpriseSaveRes) {
            // Set message assertion
            (enterpriseSaveRes.body.message).should.match('Please fill Enterprise name');

            // Handle Enterprise save error
            done(enterpriseSaveErr);
          });
      });
  });

  it('should be able to update an Enterprise if signed in', function (done) {
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

        // Save a new Enterprise
        agent.post('/api/enterprises')
          .send(enterprise)
          .expect(200)
          .end(function (enterpriseSaveErr, enterpriseSaveRes) {
            // Handle Enterprise save error
            if (enterpriseSaveErr) {
              return done(enterpriseSaveErr);
            }

            // Update Enterprise name
            enterprise.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Enterprise
            agent.put('/api/enterprises/' + enterpriseSaveRes.body._id)
              .send(enterprise)
              .expect(200)
              .end(function (enterpriseUpdateErr, enterpriseUpdateRes) {
                // Handle Enterprise update error
                if (enterpriseUpdateErr) {
                  return done(enterpriseUpdateErr);
                }

                // Set assertions
                (enterpriseUpdateRes.body._id).should.equal(enterpriseSaveRes.body._id);
                (enterpriseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Enterprises if not signed in', function (done) {
    // Create new Enterprise model instance
    var enterpriseObj = new Enterprise(enterprise);

    // Save the enterprise
    enterpriseObj.save(function () {
      // Request Enterprises
      request(app).get('/api/enterprises')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Enterprise if not signed in', function (done) {
    // Create new Enterprise model instance
    var enterpriseObj = new Enterprise(enterprise);

    // Save the Enterprise
    enterpriseObj.save(function () {
      request(app).get('/api/enterprises/' + enterpriseObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', enterprise.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Enterprise with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/enterprises/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Enterprise is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Enterprise which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Enterprise
    request(app).get('/api/enterprises/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Enterprise with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Enterprise if signed in', function (done) {
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

        // Save a new Enterprise
        agent.post('/api/enterprises')
          .send(enterprise)
          .expect(200)
          .end(function (enterpriseSaveErr, enterpriseSaveRes) {
            // Handle Enterprise save error
            if (enterpriseSaveErr) {
              return done(enterpriseSaveErr);
            }

            // Delete an existing Enterprise
            agent.delete('/api/enterprises/' + enterpriseSaveRes.body._id)
              .send(enterprise)
              .expect(200)
              .end(function (enterpriseDeleteErr, enterpriseDeleteRes) {
                // Handle enterprise error error
                if (enterpriseDeleteErr) {
                  return done(enterpriseDeleteErr);
                }

                // Set assertions
                (enterpriseDeleteRes.body._id).should.equal(enterpriseSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Enterprise if not signed in', function (done) {
    // Set Enterprise user
    enterprise.user = user;

    // Create new Enterprise model instance
    var enterpriseObj = new Enterprise(enterprise);

    // Save the Enterprise
    enterpriseObj.save(function () {
      // Try deleting Enterprise
      request(app).delete('/api/enterprises/' + enterpriseObj._id)
        .expect(403)
        .end(function (enterpriseDeleteErr, enterpriseDeleteRes) {
          // Set message assertion
          (enterpriseDeleteRes.body.message).should.match('User is not authorized');

          // Handle Enterprise error error
          done(enterpriseDeleteErr);
        });

    });
  });

  it('should be able to get a single Enterprise that has an orphaned user reference', function (done) {
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

          // Save a new Enterprise
          agent.post('/api/enterprises')
            .send(enterprise)
            .expect(200)
            .end(function (enterpriseSaveErr, enterpriseSaveRes) {
              // Handle Enterprise save error
              if (enterpriseSaveErr) {
                return done(enterpriseSaveErr);
              }

              // Set assertions on new Enterprise
              (enterpriseSaveRes.body.name).should.equal(enterprise.name);
              should.exist(enterpriseSaveRes.body.user);
              should.equal(enterpriseSaveRes.body.user._id, orphanId);

              // force the Enterprise to have an orphaned user reference
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

                    // Get the Enterprise
                    agent.get('/api/enterprises/' + enterpriseSaveRes.body._id)
                      .expect(200)
                      .end(function (enterpriseInfoErr, enterpriseInfoRes) {
                        // Handle Enterprise error
                        if (enterpriseInfoErr) {
                          return done(enterpriseInfoErr);
                        }

                        // Set assertions
                        (enterpriseInfoRes.body._id).should.equal(enterpriseSaveRes.body._id);
                        (enterpriseInfoRes.body.name).should.equal(enterprise.name);
                        should.equal(enterpriseInfoRes.body.user, undefined);

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
      Enterprise.remove().exec(done);
    });
  });
});
