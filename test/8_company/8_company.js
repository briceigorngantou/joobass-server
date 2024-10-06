const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'company';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;

//token information
const urlToken = baseUrl + "auth/login";
global.entrepriseEmail = "emmaphil25@hotmail.fr";
global.password = 'string9S#';


// identifiers to insert  while testing  Job, Application and so on.
global.companyId = '';
global.tokenCompany = '';


//test company insertion
describe('POST /api/v1/company', () => {
    it('should respond with a success message along with a single company that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": "string",
                    "surname": "string",
                    "phoneNumber": {"value": 23725507500, "valid": true},
                    "email": {
                        "value": global.entrepriseEmail,
                        "valid": true
                    },
                    "valid": true,
                    "nameCompany": "Buca Voyage",
                    "description": "Entreprise de voyage en bus à travers le Cameroun",
                    "phoneNumberCompany": {"value": 237153794613},
                    "fiscalNumber": {"value": 1000},
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Douala",
                    "website": {
                        "value": "http://bucavoyage.com",
                        "valid": true
                    },
                    "tags": ["Transport", "Delivery"],
                    "origin": "Other",
                    "affiliation":{from:global.codeAffiliation}
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
                res.body.message.should.eql('new company was created');

                global.companyId = res.body.data.id;

                done();
            });
    });
});


//test second company insertion
describe('POST /api/v1/company', () => {
    it('should respond with a success message along with a single company that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": "Fianfian",
                    "surname": "Badi",
                    "phoneNumber": {"value": 237925314687, "valid": true},
                    "email": {
                        "value": "test_company@gmail.com",
                        "valid": true
                    },
                    "valid": true,
                    "nameCompany": "FiMeruemAn",
                    "description": "Entreprise de livraison de produits",
                    "phoneNumberCompany": {"value": 237925314688},
                    "fiscalNumber": {"value": 1001},
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Yaoundé",
                    "website": {
                        "value": "http://FiMeruemAn.com",
                        "valid": true
                    },
                    "tags": ["Delivery"],
                    "origin": "LinkedIn",
//                    "affiliation":{from:global.codeAffiliation}
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
                res.body.message.should.eql('new company was created');

                global.secondCompanyId = res.body.data.id;

                done();
            });
    });
});

//get the token
describe('POST /api/v1/auth/login/company', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/' + 'company' + '?lang=en')
            .send({
                "email": global.entrepriseEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                global.tokenCompany = res.body.data.accessToken;
                done();
            });
    });
});


  // get the company list shouldn't be empty cause we just add one company previously
  describe('GET /api/v1/company', () => {
    it('should respond with a success message along with a get on all the  entreprises that were added', (done) => {
        api.get(url + '?lang=en').set('authorization', 'Bearer ' + global.tokenController)
       .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        //check the message content
        //the numbers of entreprises objects should be not null
        res.body.data.length.should.not.equal(0);
        done();
      });
    });
  });


//get a single company

describe('GET /api/v1/company/:id', () => {
    it('should respond with a success message along with a single get on a company that was added', (done) => {
        api.get(url + '/' + global.companyId + '?lang=en').set('authorization', 'Bearer ' + global.tokenCompany)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //the return object should have the same id that the one the use to get it
                //check the message content
                done();
            });
    });
});

//check affiliation code

describe('GET /api/v1/company/:id', () => {
    it('should respond with a success message along with a single get on a company that was added', (done) => {
        api.get(url + '/' + global.companyId + '?lang=en').set('authorization', 'Bearer ' + global.tokenController)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //the return object should have the same id that the one the use to get it
                //check the message content
                res.body.data.company.affiliation.code.should.be.not.empty ; 
                done();
            });
    });
});

//update a company  , here we first save the id of the company from the previous get request
describe('UPDATE /api/v1/company/:id', () => {
    it('should respond with a success message along with a single company that was updated', (done) => {
        api.put(url + '/' + global.companyId + '?lang=en')
            .send({
                "town": "Yaounde",
                "description": "you go crazy"
            })
            .set('authorization', 'Bearer ' + global.tokenCompany)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check the message content
                res.body.message.should.eql('company was updated by id ' + global.companyId);

                done();
            });
    });
});

// get a single company with false id

describe('GET /api/v1/company/:id', () => {
    const fakeId = '5f6723060a61bd49900f637d';
    it('should respond with a error message along with a single company that wasn t added', (done) => {
        api.get(url + '/' + fakeId + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be a 404 status code
                res.status.should.equal(404);
                // the response should be JSON
                res.type.should.equal('application/json');
                //the return object should have the same id that the one the use to get it
                //check the message content
                done();
            });
    });
});



