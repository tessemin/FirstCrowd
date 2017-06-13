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
      usernameOrEmail: 'username123',
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
      roles: ['user', 'enterprise'],
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
            URL: 'nuts.bolts.com'
          },
          {
            companyName: 'Dunder Mifflin Paper Co.',
            URL: 'dunder.mifflin.paper.com'
          }],
          customer: [{
            companyName: 'Cheese Factory 1',
            URL: 'cheesedomain.axa'
          }],
          competitor: [{
            companyName: 'What-cha-ma-callits',
            URL: 'ma.callits.com'
          },
          {
            companyName: 'Hoodly-doos',
            URL: 'hoodledoo.doo'
          },
          {
            companyName: 'Big Company',
            URL: 'bigco.com'
          }],
        }
    });
    
    user.enterprise = enterprise.id;
    enterprise.user = user.id;

    // Save a user to the test db and create new Enterprise
    user.save(function (err) {
      should.not.exist(err);
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
            return done();
          });
        
      })
  });
  
  it('should not be able to get the enterprise information if not logged in', function (done) {
    agent.get('/enterprises/api/enterprises/getEnterprise')
      .expect(400)
      .end(function (enterprisesGetErr, enterprisesGetRes) {
        done();
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
                var resEnterprise = enterprisesGetRes.body;

                // Set assertions
                (resEnterprise.profile.companyName).should.match('Test Company Name');

                // Call the assertion callback
                return done();
              });
          });
      });
  });
  
   it('should not be able to uppdate an invalid profile', function (done) {
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
        };
        
        // an invalid year and url
        profile.profile.yearEstablished = '-1';
        profile.profile.URL = 'invalid';

        // Save a new profile
        agent.post('/enterprises/api/enterprises/profile/')
          .send(profile)
          .expect(422)
          .end(done());
      });
  });
  
  it('should not be able to save profile if not signed in', function (done) {
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
    // Save a Enterprise profile
    agent.post('/enterprises/api/enterprises/profile/')
      .send(profile)
      .expect(400)
      .end(done());
  });
  
  
  /*
   * Suppliers
   */
  it('should be able to uppdate a supplier if logged in', function (done) {
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
            enterprise.partners.supplier[0].companyName = 'Test Company';
            // Save a new supplier
            agent.post('/enterprises/api/enterprises/suppliers/')
              .send(enterprise.partners.supplier[0])
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
                    
                    enterprise = enterprisesGetRes.body;
                    
                    (enterprise.partners.supplier[0].companyName).should.eql('Test Company');

                    // Call the assertion callback
                    done();
                    
                  });
              });
          });
      });
  });
  
  it('should not be able to uppdate a bad supplier', function (done) {
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
            enterprise.partners.supplier[0].companyName = ''
            
            // Save a new supplier
            agent.post('/enterprises/api/enterprises/suppliers/')
              .send(enterprise.partners.supplier[0])
              .expect(422)
              .end(done());
          });
      });
  });
  
  it('should be able to create a new supplier if logged in', function (done) {
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

        var supplier = {
          companyName: 'New Company',
          URL: 'new@company.com'
        }
        // Save a new supplier
        agent.post('/enterprises/api/enterprises/suppliers/')
          .send(supplier)
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
                
                enterprise = enterprisesGetRes.body;
                
                (enterprise.partners.supplier[enterprise.partners.supplier.length - 1].companyName).should.eql('New Company');
                
                // Call the assertion callback
                done();
                
              });
          });
      });
  });
  
  it('should not be able to create a bad supplier', function (done) {
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

        var supplier = {
          companyName: '',
          URL: 'new@company.com'
        }
        // Save a new supplier
        agent.post('/enterprises/api/enterprises/suppliers/')
          .send(supplier)
          .expect(422)
          .end(done());
      });
  });
  
  it('should not be able to uppdate an invalid supplier', function (done) {
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

        var supplier = {
          _id: '3gh4hjwegbfjhsk',
          companyName: '',
          URL: 'new@company.com'
        }
        // Save a new supplier
        agent.post('/enterprises/api/enterprises/suppliers/')
          .send(supplier)
          .expect(422)
          .end(done());
      });
  });
  
  it('should not be able to save entperise suppliers if not signed in', function (done) {
    var supplier = {
      companyName: '',
      URL: 'new@company.com'
    }
    // Save a new supplier
    agent.post('/enterprises/api/enterprises/suppliers/')
      .send(supplier)
      .expect(422)
      .end(done());
  });
  
  it('should be able to delete a supplier if logged in', function (done) {
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
        // Get this Enterprise
        agent.get('/enterprises/api/enterprises/getEnterprise/')
          .end(function (enterprisesGetErr, enterprisesGetRes) {
            // Handle Enterprises save error
            if (enterprisesGetErr) {
              return done(enterprisesGetErr);
            }

            // Get Enterprise from res
            var enterprise = enterprisesGetRes.body;
            
            var length = enterprise.partners.supplier.length;

            // Set assertions
            enterprise.partners.supplier[0].companyName = '';
            enterprise.partners.supplier[0].URL = '';
            
            // Save a new supplier
            agent.post('/enterprises/api/enterprises/suppliers/')
              .send(enterprise.partners.supplier[0])
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
                    
                    enterprise = enterprisesGetRes.body;
                    
                    (enterprise.partners.supplier[0].length).should.eql(length - 1);

                    // Call the assertion callback
                    done();
                    
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
