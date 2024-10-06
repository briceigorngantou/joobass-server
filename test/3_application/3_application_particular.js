let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const resource= 'application' ;
const baseUrl = '/api/v1/particular/me/';
const url = baseUrl + resource;
const urlParticular = '/api/v1/particular';
const urlAdministrator = '/api/v1/administrator';
const applicationUrl = '/api/v1/application';
global.applicationIdParticular = "";
global.applicationIdParticular3 = "";
global.applicationIdParticularJob2 = "";
global.applicationIdParticular4 = "";
global.applicationIdParticular5 = "";

//test application insertion
/*
describe('POST '+url+' with non valid IdentityCard', () => {
  it('should respond with a warning  when a jober with non valid identitycard was added', (done) => {
      api.post(url + '?lang=en')
    .send({
      "job": global.jobParticularId,
      "applicationDate": "2020-03-29T08:12:48.678Z",
      "motivations": " I would like to take this position whi",
      "state": "done"
    }).set('authorization','Bearer '+global.tokenJober2 )
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(403);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      //check the message content
      console.log("message "+res.body.message);
        res.body.message.should.eql('Your identity card should be valid. Please  upload your identity card');
      done();
    });
  });
});

 */


/*
// non valid school Level
// TODO  modified the test ask it lies on the fact the jober2 has a non valid  identifyCard
describe('POST ' + url + ' with non valid school Level was added', () => {
    it('should respond with a warning  when a jober with non valid school Level was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                "job": global.jobParticularId2,
                "applicationDate": "2020-03-29T08:12:48.678Z",
                "motivations": " I would like to take this position whi",
                "state": "done"
            }).set('authorization', 'Bearer ' + global.tokenJober2)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(403);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                console.log("message " + res.body.message);
                done();
            });
    });
});

 */

//  Valid identity can apply to a job

describe('POST '+url, () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(url + '?lang=en')
      .send({
        "job": global.jobParticularId,
        "applicationDate": "2020-03-29T08:12:48.678Z",
        "motivations": " I would like to take this position whi",
        "state": "done"
      }).set('authorization','Bearer '+global.tokenJober )
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql('new application was created');

        global.applicationIdParticular = res.body.data.id;
        done();
      });
    });
  });

  //can't apply for a job twice

describe('POST /api/v1/particular/me/application', () => {
  it('should respond with an error message along when same jober try to apply twice for a job', (done) => {
      api.post(urlParticular + '/me/application?lang=en')
    .send({
      "employee": global.idJober,
      "job": global.jobParticularId,
      "applicationDate": "2020-03-29T08:12:48.678Z",
      "motivations": " I would like to take this position whi",
      "state": "done"
    }).set('authorization','Bearer '+global.tokenJober )
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(403);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      //check the message content
        res.body.message.should.eql("You can't apply twice to the same job.");
        done();
    });
  });
});


// another jober can apply  for the same  job even if nbPlaces == 1
describe('POST ' + url, () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                "job": global.jobParticularId,
                "applicationDate": "2020-03-29T08:12:48.678Z",
                "motivations": "some text",
                "state": "done"
            }).set('authorization', 'Bearer ' + global.tokenJober3)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('new application was created');
                global.applicationIdParticular3 = res.body.data.id;
                done();
            });
    });
});

// another jober can apply  for the same  job even if nbPlaces == 1
describe('POST ' + url, () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                "job": global.jobParticularId3,
                "applicationDate": "2020-03-29T08:12:48.678Z",
                "motivations": "some text 3",
                "state": "done"
            }).set('authorization', 'Bearer ' + global.tokenJober3)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('new application was created');
                global.applicationIdParticular5 = res.body.data.id;
                done();
            });
    });
});

//application for job 4
describe('POST ' + url, () => {
  it('should respond with a success message along with a single application that was added', (done) => {
      api.post(url + '?lang=en')
          .send({
              "job": global.jobParticularId4,
              "motivations": "some text",
              "state": "done"
          }).set('authorization', 'Bearer ' + global.tokenJober3)
          .end((err, res) => {
              // there should be no errors
              should.not.exist(err);
              // there should be a 200 status code
              // (indicating that something was "created")
              res.status.should.equal(200);
              // the response should be JSON
              res.type.should.equal('application/json');
              // the JSON response body should have a
              // key-value pair of {"status": "success"}
              //check the message content
              res.body.message.should.eql('new application was created');
              global.applicationIdParticular4 = res.body.data.id;
              done();
          });
  });
});


// get the application list shouldn't be empty cause we just add one application previously
  describe('GET /api/v1/application', () => {
    it('should respond with a success message along with a get on all the  applications that were added', (done) => {
        api.get(url + '?lang=en')
      .set('authorization','Bearer '+global.tokenJober)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        //check the message content
        //the numbers of applications objects should be not null
        res.body.data.applications.length.should.not.equal(0);
        done();
      });
    });
  });

/*
  // Other users (out of admin ) can't have access to the applications, the jobProvider should uses // get the application list shouldn't be empty cause we just add one application previously
  describe('GET '+url, () => {
    it('should respond with a success message along with a get on all the  applications that were added', (done) => {
        api.get(url + '?lang=en')
      .set('authorization','Bearer '+global.tokenJober2)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        //the numbers of applications objects should be not null
        res.body.data.applications.length.should.equal(0);

        done();
      });
    });
  });

 */


  describe('GET '+url, () => {
    it('should respond with a success message along with a get on all the  applications that were added', (done) => {
        api.get(urlParticular + '/me/job/' + global.jobParticularId + '/application?lang=en')
      .set('authorization','Bearer '+global.token)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        //the numbers of applications objects should be not null
        res.body.data.applications.length.should.not.equal(0);
        done();
      });
    });
  });


  //get a single application

describe('GET '+url+'/:id', () => {
    it('should respond with a success message along with a single get on a application that was added', (done) => {
        api.get(url + '/' + global.applicationIdParticular + '?lang=en')
       .set('authorization','Bearer '+global.tokenJober)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        done();
      });
    });
  });


//get a single application with particular route
describe('GET '+url+'/:id', () => {
  it('should respond with a success message along with a single get on a application that was added', (done) => {
      api.get(url + '/' + global.applicationIdParticular + '?lang=en')
     .set('authorization','Bearer '+global.tokenJober)
     .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      done();
    });
  });
});



  //get a single application with false id

describe('GET '+url+'/:id 2', () => {
    const fakeId = '5ds' ;
    it('should respond with a error message along with a single application that wasn t added', (done) => {
        api.get(url + '/' + fakeId + '?lang=en')
       .set('authorization','Bearer '+global.tokenJober)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
           res.status.should.equal(500);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check the respond code
        done();
      });
    });
  });


//get candidate from application
describe('GET ' + url + '/:idApplciationParticular/candidate', () => {
  it('should respond with a success message along with a single get on candidate from a application that was added', (done) => {
      api.get(url + '/' + global.applicationIdParticular + '/candidate?lang=en')
        .set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          //check the surname is not null
          done();
        });
  });
});


//update an application  , here we first save the id of the application from the previous get request
describe('UPDATE '+url+'/:id', () => {
  console.log(global.applicationIdParticular);
  const motivation = "I'm tryna have more money to bill school";
    it('should respond with a success message along with a single application that was updated', (done) => {
        api.put(url + '/' + global.applicationIdParticular + '?lang=en')
      .set('authorization','Bearer '+global.tokenJober)
      .send({
        "motivations": motivation
      })
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "updated")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
         res.body.data.motivations.should.equal(motivation);
        done();
      });
    });
  });


// get all applications from a specific job
describe('GET '+urlParticular+'/me/job/:idJob/application', () => {
  it('should respond with a success message along with a single get on candidate from a application from a specific job', (done) => {
      api.get(urlParticular + '/me/job/' + global.jobParticularId + '/application?lang=en')
          .set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          //check the surname is not null
          res.body.data.applications.length.should.not.equal(0);
          done();
        });
  });
});

  // jobProvider sees an application
describe('UPDATE /api/v1/application/:idApplication/markApplicationAsViewed', () => {
  let state= "viewed";
    it('should respond with a success message along with a single application has been marked as viewed', (done) => {
        api.put(applicationUrl + '/' + global.applicationIdParticular + '/markApplicationAsViewed?lang=en')
      .set('authorization','Bearer '+global.token)
      .send({})
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "updated")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
           res.body.message.should.equal("the application was marked as Viewed");
        done();
      });
    });
  });

  // jobProvider validate an application
describe('UPDATE /api/v1/particular/me/application/:id/appreciate', () => {
  let state= "validated";
    it('should respond with a success message along with a single application that was updated', (done) => {
        api.put(urlParticular + '/me/application/' + global.applicationIdParticular + '/appreciate?lang=en')
      .set('authorization','Bearer '+global.token)
      .send({
          "state": state
      })
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "updated")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
           res.body.message.should.equal("your appreciation has been save for the application");
        done();
      });
    });
  });

// jobProvider validate an application
describe('UPDATE /api/v1/particular/me/application/:id/appreciate 2', () => {
    let state= "validated";
    it('should respond with a success message along with a single application that was updated', (done) => {
        api.put(urlParticular + '/me/application/' + global.applicationIdParticular5 + '/appreciate?lang=en')
            .set('authorization','Bearer '+global.token)
            .send({
                "state": state
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.message.should.equal("your appreciation has been save for the application");
                done();
            });
    });
});

// Can't apply when enough applications have been validated
describe('POST '+url, () => {
  it('should respond with a success message along with a single application that was added', (done) => {
      api.post(url + '?lang=en')
    .send({
      "employee": global.idJober,
      "job": global.jobParticularId,
      "applicationDate": "2020-03-29T08:12:48.678Z",
      "motivations": " I would like to take this position to save money for high school year !",
      "state": "done"
    }).set('authorization','Bearer '+global.tokenJober )
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(403);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      done();
    });
  });
});


//sceneriot 2 ,  jober can't apply when enough applications have been validated


//jober1 apply for job2
describe('POST ' + url, () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                "job": global.joBid,
                "applicationDate": "2020-03-29T08:12:48.678Z",
                "motivations": " I 'm currently looking for such a job",
                "state": "done"
            }).set('authorization', 'Bearer ' + global.tokenJober)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('new application was created');

                global.applicationIdParticularJob2 = res.body.data.id;
                done();
            });
    });
});

// we validate jober application on jober2

describe('UPDATE /api/v1/application/:idApplication/appreciate', () => {
    let state = "validated";
    it('should respond with a success message along with a single application that was updated', (done) => {
        api.put(applicationUrl + '/' + global.applicationIdParticularJob2 + '/appreciate?lang=en&employer=' + global.idJobProvider)
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .send({
                "state": state
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.message.should.equal("your appreciation has been save for the application");
                done();
            });
    });
});



// jober3  can't apply for job2 because there is too much applications validated

describe('POST ' + url, () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                "job": global.joBid,
                "applicationDate": "2020-03-29T08:12:48.678Z",
                "motivations": " I would like to take this position whi",
                "state": "done"
            }).set('authorization', 'Bearer ' + global.tokenJober3)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(403);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql("You can no longer  apply, there are already enough applications validated");
                done();
            });
    });
});

// admin validate the jober1's application

// affect jober 1 to   job2

describe('UPDATE api/v1/administrator/job/:idJob/choose/:idJober', () => {
  it('should respond with a success message along with a single application that was updated', (done) => {
      api.put(urlAdministrator + '/job/' + global.jobParticularId3 + '/choose/' + global.idJober)
          .set('authorization', 'Bearer ' + global.tokenAdmin)
          .end((err, res) => {
              // there should be no errors
              should.not.exist(err);
              // there should be a 200 status code
              // (indicating that something was "updated")
              res.status.should.equal(200);
              // the response should be JSON
              res.type.should.equal('application/json');
              res.body.message.should.equal("the jober has been saved for the job");
              done();
          });
  });
});