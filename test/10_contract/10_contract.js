let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'contract';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
//token information

global.idContract = "";
global.idContract2 = "";


//test create contract as admin
describe('POST /api/v1/contract/job/:jobId jobProvider', () => {
    it('should respond with a success message along with a single contract that was added', (done) => {
        api.post(url + '/job/' + global.jobParticularId + '?lang=en')
            .send(
                {
                    nbTransactionsTodo: 1
                })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                global.idContract = res.body.data.id;
                done();
            });
    });
});



