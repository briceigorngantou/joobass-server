const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);

// particular
let serviceName = 'particular';
let baseUrl = '/api/v1/';
const urlParticular = baseUrl + serviceName;


//application 

serviceName = 'application';
baseUrl = '/api/v1/';
const urlApplication = baseUrl + serviceName;


// check access to candidate information
// get candidate from application
describe('GET /api/v1/application/:id/candidate', () => {
  it('should respond with a success message along with a single get on candidate from a application that was added', (done) => {
      api.get(urlApplication + '/' + global.applicationIdParticular + '/candidate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          //check we can get the email
            console.log("mail " + res.body.data);
            res.body.data.surname.length.should.equal(1);
          done();
        });
  });
});


// delete an application particularApplication

describe('DELETE /api/v1/application/:id', () => {
  console.log('idApplication delete  : ' + global.applicationIdParticular);
    it('should respond with a success message along with a single application that was deleted', (done) => {
        api.delete(urlApplication + '/' + global.applicationIdParticular + '?lang=en')
      .set('authorization','Bearer '+global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "deleted")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check on message
        res.body.message.should.equal('the application was deleted by id : '+global.applicationIdParticular) ;
        done();
      });
    });
  });
// delete an application particularApplication

describe('DELETE /api/v1/application/:id', () => {
  console.log('idApplication delete  : ' + global.applicationIdParticular3);
    it('should respond with a success message along with a single application that was deleted', (done) => {
        api.delete(urlApplication + '/' + global.applicationIdParticular3 + '?lang=en')
      .set('authorization','Bearer '+global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "deleted")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check on message
        res.body.message.should.equal('the application was deleted by id : '+global.applicationIdParticular) ;
        done();
      });
    });
  });

//job
 serviceName = 'job' ;
const urlJob = baseUrl + serviceName;

// delete a job

describe('DELETE /api/v1/job/:id', () => {
  console.log('id delete job : ' + global.joBid);
    it('should respond with a success message along with a single job that was deleted', (done) => {
        api.delete(urlJob + '/' + global.joBid + '?lang=en').set('authorization', 'Bearer ' + global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "deleted")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check on message 
        res.body.message.should.equal('the job was deleted by id : '+global.joBid) ;
        done();
      });
    });
  });


describe('DELETE /api/v1/job/:id', () => {
  console.log('id delete job : ' + global.jobParticularId);
    it('should respond with a success message along with a single job that was deleted', (done) => {
        api.delete(urlJob + '/' + global.jobParticularId + '?lang=en').set('authorization', 'Bearer ' + global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "deleted")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check on message
        res.body.message.should.equal('the job was deleted by id : '+global.jobParticularId) ;
        done();
      });
    });
  });


//delete transaction
  serviceName = 'transaction' ;
  baseUrl = '/api/v1/';
  const urlTransaction = baseUrl + serviceName;
  
describe('DELETE /api/v1/transaction', () => {
  it('should respond with a success message along with a single transaction that was deleted', (done) => {
    api.delete(urlTransaction+ '/' + global.transactionId+'?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "deleted")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          //check on message
          res.body.message.should.equal('the transaction was deleted by id : ' + global.transactionId);
          done();
        });
  });
});


//delete Particulars

describe('DELETE /api/v1/particular/:id jobprovider', () => {
    it('should respond with a success message along with a single particular that was deleted', (done) => {
        api.delete(urlParticular + '/' + global.idJobProvider + '?lang=en')
      .set('authorization','Bearer '+global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // check on message
                res.body.message.should.equal('the particular was deleted by id : ' + global.idJobProvider);
                done();
            });
    });
});



describe('DELETE /api/v1/particular/:id jober', () => {
    it('should respond with a success message along with a single particular that was deleted', (done) => {
        api.delete(urlParticular + '/' + global.idJober + '?lang=en')
      .set('authorization','Bearer '+global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // check on message
                res.body.message.should.equal('the particular was deleted by id : ' + global.idJober);
                done();
            });
    });
});


describe('DELETE /api/v1/particular/:id controller', () => {
    it('should respond with a success message along with a single particular that was deleted', (done) => {
        api.delete(urlParticular + '/' + global.idController + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // check on message
                res.body.message.should.equal('the particular was deleted by id : ' + global.idController);
                done();
            });
    });
});




describe('DELETE /api/v1/particular/:id Jober2', () => {
  it('should respond with a success message along with a single particular that was deleted', (done) => {
      api.delete(urlParticular + '/' + global.idJober2 + '?lang=en')
    .set('authorization','Bearer '+global.tokenAdmin)
     .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "deleted")
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      //check on message
      res.body.message.should.equal('the particular was deleted by id : '+global.idJober2) ;
      done();
    });
  });
});


describe('DELETE /api/v1/particular/:id Jober3', () => {
  it('should respond with a success message along with a single particular that was deleted', (done) => {
      api.delete(urlParticular + '/' + global.idJober3 + '?lang=en')
    .set('authorization','Bearer '+global.tokenAdmin)
     .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "deleted")
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      //check on message
      res.body.message.should.equal('the particular was deleted by id : '+global.idJober2) ;
      done();
    });
  });
});



//notification
serviceName = 'notification';
const urlNotification = baseUrl + serviceName;

describe('DELETE /api/v1/notification/:idNotification ', () => {
    it('should respond with a success message along with a single particular that was deleted', (done) => {
        api.delete(urlNotification + '/' + global.idNotification + '?lang=en')
            .set('authorization','Bearer '+global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check on message
                res.body.message.should.equal('the notification was deleted by id : ' + global.idNotification);
                done();
            });
    });
});


describe('DELETE /api/v1/particular/:id admin', () => {
    it('should respond with a success message along with a single particular that was deleted', (done) => {
        api.delete(urlParticular + '/' + global.idAdmin + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check on message
                res.body.message.should.equal('the particular was deleted by id : ' + global.idAdmin);
                done();
            });
    });
});

describe('DELETE /api/v1/litigation', () => {
    it('should respond with a success message along with a single litigation that was deleted', (done) => {
        api.delete(url + '/' + global.litigationId + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "deleted")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check on message
                res.body.message.should.equal('the litigation was deleted by id : ' + global.litigationId);
                done();
            });
    });
});
