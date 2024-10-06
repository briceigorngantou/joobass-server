let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'prospect';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
//token information
const urlToken = baseUrl + "auth/login";


//test prospect insertion
describe('POST /api/v1/prospect prospect', () => {
    it('should respond with a success message along with a single prospect that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": "Prospect 1",
                    "surname": "surname",
                    "phoneNumber": 699820046,
                    "email": "emmaphil50@gmail.com",
                    "gender": "Man",
                    "town": "Douala"
                })
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
                res.body.message.should.eql('New prospect created');

                done();
            });
    });
});

//get the token Admin
describe('POST /api/v1/auth/login/administrator Admin', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/administrator?lang=en')
            .send({
                "email": global.adminEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenAdmin = res.body.data.accessToken;
                done();
            });
    });
});

//test retrieving all prospects
describe('GET /api/v1/prospect prospect', () => {
    it('should respond with a success message along with a list of prospect', (done) => {
        api.get(url + '?lang=en').set('authorization', 'Bearer ' + global.tokenAdmin)
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
                res.body.data.prospects.length.should.not.equal(0);
                done();
            });
    });
});
