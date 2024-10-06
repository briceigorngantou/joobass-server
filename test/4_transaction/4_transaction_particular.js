let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const resource = 'transaction';
const baseUrl = '/api/v1/particular/me/';
const baseUrlAdmin = '/api/v1/';
const url = baseUrl + resource;
const urlAdmin = baseUrlAdmin + resource;
const urlParticular = '/api/v1/particular';


// get the transaction list shouldn't be empty cause we just add one transaction previously

// Pay for fees job writer
describe('pay_fees_for_job_bodyguard', () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(urlParticular + "/me/transaction" + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .send(
                {
                    "job": global.jobParticularId3,
                    "emitter": global.idJobProvider,
                    "payment": 60300,
                    "idCharge": "action manuelle",
                    "state": "validated",
                    "type": "fees"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON 'the application found by id : ' + req.params.idApplication
                res.type.should.equal('application/json');
                //check the message
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                global.transactionIdFirstPayment = res.body.data.id;
                console.log(global.transactionIdFirstPayment);
                done();
            });
    });
});

describe('get_all_transactions', () => {
    it('should respond with a success message along with a get on all the  transactions that were added', (done) => {
        api.get(urlAdmin + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
           console.log(res.body.data);
        // the JSON response body should have a
        //check the message content
        //the numbers of transactions objects should be not null
        res.body.data.transactions.length.should.not.equal(0);
        done();
      });
    });
  });
// Verify we have access to full jober info

  //get a single transaction

describe('get_specific_transaction_by_id_admin_mode', () => {
    it('should respond with a success message along with a single get on a transaction that was added', (done) => {
        api.get(urlAdmin + '/' + global.transactionIdFirstPayment + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
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

  //get a single transaction with false id

describe('get_transaction_with_false_id_by_admin_mode', () => {
    const fakeId = '5ds' ;
    it('should respond with a error message along with a single transaction that wasn t added', (done) => {
        api.get(urlAdmin + '/' + fakeId + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
           res.status.should.equal(404);
        // the response should be JSON
        res.type.should.equal('application/json');
        //check the respond code
        done();
      });
    });
  });



  //update a transaction  , here we first save the id of the transaction from the previous get request
describe('update_transaction_by_admin_with_transaction_id', () => {
    const state = "validated";
    it('should respond with a success message along with a single transaction that was updated', (done) => {
        api.put(urlAdmin + '/' + global.transactionIdFirstPayment + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
      .send({
          "idCharge": "xps",
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
           res.body.data.state.should.equal(state);
        done();
      });
    });
  });


// Verify we have access to full jober info to all info
describe('verify_that_after_payment_we_have_all_data', () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.get(urlParticular + "/me/application/" + applicationIdParticular + "/candidate" + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON 'the application found by id : ' + req.params.idApplication
                res.type.should.equal('application/json');
                //check the message
                should.exist(res.body.data.email);
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                done();
            });
    });
});

//Pay for fees with wrong amount

// Pay for fees job writer
describe('pay_fees_for_bodyguard_with_wrong_amount', () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(urlParticular + "/me/transaction" + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .send(
                {
                    "job": global.jobParticularId,
                    "emitter": global.idJobProvider,
                    "payment": 100,
                    "idCharge": "action manuelle",
                    "state": "validated",
                    "type": "fees"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(400);
                // the response should be JSON 'the application found by id : ' + req.params.idApplication
                res.type.should.equal('application/json');
                //check the message
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                done();
            });
    });
});

//Pay for fees with wrong type

describe('pay_fees_for_bodyguard_with_wrong_type', () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(urlParticular + "/me/transaction" + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .send(
                {
                    "job": global.jobParticularId,
                    "emitter": global.idJobProvider,
                    "payment": 1200,
                    "idCharge": "action manuelle",
                    "state": "validated",
                    "type": "paymentToJobaas"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(400);
                // the response should be JSON 'the application found by id : ' + req.params.idApplication
                res.type.should.equal('application/json');
                //check the message
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                done();
            });
    });
});


// Pay for fees job writer
describe('pay_fees_for_job_writer', () => {
    it('should respond with a success message along with a single application that was added', (done) => {
        api.post(urlParticular + "/me/transaction" + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .send(
                {
                    "job": global.jobParticularId,
                    "emitter": global.idJobProvider,
                    "payment": 110300,
                    "idCharge": "action manuelle",
                    "state": "validated",
                    "type": "fees"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON 'the application found by id : ' + req.params.idApplication
                res.type.should.equal('application/json');
                //check the message
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                done();
            });
    });
});