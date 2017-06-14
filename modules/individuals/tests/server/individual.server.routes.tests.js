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
  
  it('should be able to get the users Individual if logged in', function (done) {
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

            // Check individual's accuracy
            (individual.bio.profession).should.match('sharpening sticks');
            
            // Call the assertion callback
            done();
          });
      });
  });
  
  it('should not be able to get the users Individual if not logged in', function (done) {
    agent.get('/individuals/api/individuals/getIndividual/')
      .expect(400)
      .end(function (individualGetErr, individualGetRes) {
        // Call the assertion callback
        done(individualGetErr);
      });
  });
  
  it('should be able to save an individual\'s Certifications', function (done) {
    // Login before saving certifications
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
        } else {
          individual.certification[0].certificationName = 'Planet Hacker Commendation of Merit';
          
          agent.post('/individuals/api/individuals/certifications/')
            .send(individual.certification)
            .end(function (individualEducationErr, individualEducationRes) {
              (individualEducationRes.body.certification[0].certificationName).should.eql('Planet Hacker Commendation of Merit');
              done(individualEducationErr);
            });
        }
      });
  });
  
  it('should be able to save an individual\'s Education', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
        } else {
          individual.schools[0].schoolName = 'SpaceMaster AstroAcademy';
          
          agent.post('/individuals/api/individuals/education/')
            .send(individual.schools)
            .end(function (individualEducationErr, individualEducationRes) {
              (individualEducationRes.body.schools[0].schoolName).should.eql('SpaceMaster AstroAcademy');
              done(individualEducationErr);
            });
        }
      });
  });
  
  it('should be able to save an individuals Skills', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
        } else {
            var testSkills = [{
            skill: 'Space piloting',
            firstUsed: '03/1/2059',
            locationLearned: 'Earth, Mars'
          }];
      
          agent.post('/individuals/api/individuals/skills/')
            .send(testSkills)
            .expect(200)
            .end(function (individualSkillsErr, individualSkillsRes) {
              (individualSkillsRes.body.skills[0].locationLearned[0]).should.eql('Earth');
              (individualSkillsRes.body.skills[0].locationLearned[1]).should.eql('Mars');
              done(individualSkillsErr);
            });
        }
      });
  });
  
  it('should be able to save an individuals Experiences', function (done) {
    // Login before saving certifications
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
        } else {
          var testExperience = [{
            employer: 'Centauri Institute of Ethical Xenobiology',
            jobTitle: 'Pilot',
            description: 'Fly spaceships',
            skills: 'Piloting, Conversation',
            startDate: '02/29/2059'
          }];
          
          agent.post('/individuals/api/individuals/experiences/')
            .send(testExperience)
            .expect(200)
            .end(function (individualExperiencesErr, individualExperiencesRes) {
              (individualExperiencesRes.body.jobExperience[0].employer).should.eql('Centauri Institute of Ethical Xenobiology');
              done(individualExperiencesErr);
            });
        }
      });
  });
  
  it('should be able to save an individuals Bio', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          console.log(signinErr);
        } else {
          individual.bio.profession = 'Pilot';
          
          agent.post('/individuals/api/individuals/bio/')
            .send(individual.bio)
            .expect(200)
            .end(function (individualBioErr, individualBioRes) {
              done(individualBioErr);
            });
        }
      });
    
  });
  
  afterEach(function (done) {
    User.remove().exec(function () {
      Individual.remove().exec(done);
    });
  });
});
