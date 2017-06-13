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
describe('Individual CRUD tests:', function () {

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
        'individual'
      ],
      phone: '123456789',
      contactPreference: 'phone',
      provider: 'local'
    });
    
    individual = new Individual({
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
          concentration: ['Algorithm Design', 'Data Structures']
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
          concentration: ['Algorithm Design', 'Data Structures']
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
        locationLearned: ['SIC', 'SIU']
      }, {
        skill: {
          name: 'Java'
        },
        firstUsed: '08/1/2016',
        locationLearned: ['SIU']
      }],
      tools: [{
        tool: {
          name: 'calculators'
        }
      }, {
        tool: {
          name: 'computers'
        }
      }],
      specialities: [{
        speciality: {
          name: 'Artifical Intelligence'
        }
      }]
    });
        
    user.individual = individual;
    individual.user = user.id;

    // Save a user to the test db and create new Individual
    user.save(function (err) {
      if (err) {
        console.log(err);
      }
      individual.save(function (err) {
        if (err) {
          console.log(err);
        }
        done();
      });
    });
  });
  
  // Saving new individuals is part of the user unit tests;
  // it's done when creating a new user
  
  it.only('should be able to get the users Individual if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        
        agent.get('/individuals/api/individuals/getIndividual/')
          .end(function (individualGetErr, individualGetRes) {
            if (individualGetErr) {
              return done(individualGetErr);
            }
            // Get Individual from res
            var individual = individualGetRes.body;

            // Set assertions
            console.log(individualGetRes.body);
            (individual.bio.profession).should.match('sharpening sticks');

            // Call the assertion callback
            done();
          });
      });
  });
  
  it('should not be able to get the users Individual if not logged in', function (done) {
    agent.post('/individuals/api/individuals/getIndividual/')
      .send()
      .expect(403)
      .end(function (individualGetErr, individualGetRes) {
        done(individualGetErr);
      });
  });
  
  it('should be able to save an individuals Certifications', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        // code goes here not below! force synchronicity!
      });
    console.log(individual.certification);
    agent.post('/individuals/api/individuals/certifications/')
      .send(individual.certification)
      .expect(200)
      .end(function (individualCertificationErr, individualCertificationRes) {
        done(individualCertificationErr);
      });
  });
  
  it('should be able to save an individuals Education', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
          console.log('BIG PROBLEM');
        } else {
          console.log('HUGE CONCERNS');
          console.log('user: ' + JSON.stringify(signinRes.body) + '\n');
        }
      });
      
    individual.schools[0].schoolName = 'Ohio State University';
    
    agent.post('/individuals/api/individuals/education/')
      .send(individual.schools)
      .end(function (individualEducationErr, individualEducationRes) {
        console.log('\n'+JSON.stringify(individualEducationRes.body, null, 2));
        (individualEducationRes.body[0].schoolName).should.eql('Ohio State University');
        done(individualEducationErr);
      });
  });
  
  it('should be able to save an individuals Skills', function (done) {
    agent.post('/individuals/api/individuals/skills/')
      .send(individual.skills)
      .expect(200)
      .end(function (individualSkillsErr, individualSkillsRes) {
        done(individualSkillsErr);
      });
  });
  
  it('should be able to save an individuals Experiences', function (done) {
    agent.post('/individuals/api/individuals/experiences/')
      .send(individual.jobExperience)
      .expect(200)
      .end(function (individualExperiencesErr, individualExperiencesRes) {
        done(individualExperiencesErr);
      });
  });
  
  it('should be able to save an individuals Bio', function (done) {
    agent.post('/individuals/api/individuals/bio/')
      .send(individual.bio)
      .expect(200)
      .end(function (individualBioErr, individualBioRes) {
        done(individualBioErr);
      });
    
  });
  
  afterEach(function (done) {
    User.remove().exec(function () {
      Individual.remove().exec(done);
    });
  });
});
