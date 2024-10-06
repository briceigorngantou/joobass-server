let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const resource = 'litigation';
const baseUrl = '/api/v1/particular/me/';
const url = baseUrl + resource;
const urlParticular = '/api/v1/particular';

global.litigationId = "";

/*
//test litigation insertion 
describe('POST /api/v1/litigation', () => {
    it('should respond with a success message along with a single litigation that was added', (done) => {
        api.post(url + '?lang=en')
      .send(
        {
            "application": global.applicationIdParticular,

            "description": "the guy isn't serious and  did steal my computer ",
            "state": "resolved",
            "employee": global.idJober,
            "employer": global.idJobProvider,
            "receiver": "employee",
            "job": global.jobParticularId
        }).set('authorization','Bearer '+global.token)
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
        res.body.message.should.eql('new litigation was created');

        global.litigationId = res.body.data.id;
        done();
      });
    });
  });

  // get the litigation list shouldn't be empty cause we just add one litigation previously
  describe('GET /api/v1/litigation', () => {
      it('should respond with a success message along with a get on all the  litigations were returned', (done) => {
          api.get(url + '?lang=en')
          .set('authorization', 'Bearer ' + global.token)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        //check the message content
        res.body.message.should.eql('there are litigations');
        
        //the numbers of litigations objects should be not null
        res.body.data.litigations.length.should.not.equal(0);

        done();
      });
    });
  });


  //get a single litigation  

describe('GET /api/v1/litigation/:id', () => {
    it('should respond with a success message along with a single get on a litigation that was added', (done) => {
        api.get(url + '/' + global.litigationId + '?lang=en')
       .set('authorization','Bearer '+global.token)
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

  //get a single litigation with false id 

describe('GET /api/v1/litigation/:id 2', () => {
    const fakeId = '5ds' ;
    it('should respond with a error message along with a single litigation that wasn t added', (done) => {
        api.get(url + '/' + fakeId + '?lang=en')
       .set('authorization','Bearer '+global.token)
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



  //update a litigation  , here we first save the id of the litigation from the previous get request 
describe('UPDATE /api/v1/litigation/:id', () => {
    const state = "cancelled";
    it('should respond with a success message along with a single litigation that was updated', (done) => {
        api.put(url + '/' + global.litigationId + '?lang=en')
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

           res.body.data.state.should.equal(state);
        done();
      });
    });
  });
*/


