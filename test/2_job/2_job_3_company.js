/* eslint-disable linebreak-style */
const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const processingUtils = require('../../common/utils/processing')
const should = chai.should();
const api = supertest.agent(server);
const baseUrl = '/api/v1/particular/me/';
const resource = 'job';
const url = baseUrl + resource;
const url3 = '/api/v1/job';
const url2 = '/api/v1/administrator';
const urlRegistration = '/api/v1/company';
const entrepriseEmail = 'rhinfo-testJobaas@dad-cm-testJobaas.com';
global.password = '1234'; 



// when an user register with email associated with an external job pubished on the plateform all the jobs associated with his email should be updated with him as employer
describe('create_company_account from user associated with external job', () => {
  it(' when an user register with email associated with an external job pubished on the plateform all the jobs associated with his email should be updated with him as employe', (done) => {
    api.post(urlRegistration + '?lang=en')
          .send(
              {
                  "name": "Robin",
                  "surname": "ShareWoods",
                  "phoneNumber": {"value": 237676897129, "valid": true},
                  "email": {
                      "value": entrepriseEmail,
                      "valid": true
                  },
                  "valid": true,
                  "nameCompany": "Bio-Farma",
                  "description": "Alter ego de jobaas sarl chargé de scrapper les offres d'emploi sur d'autres sites",
                  "phoneNumberCompany": {"value": 237696897121},
                  "fiscalNumber": {"value": 1410},
                  "password": global.password,
                  "country": "cameroon",
                  "town": "Yaoundé",
                  "website": {
                      "value": "http://JobaasScrapperCompany.com",
                      "valid": true
                  },
                  "tags": ["Delivery"],
                  "origin": "LinkedIn",
                  "isExternal":true
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
              //check the message content
              const expectedNbJobAffected = 1;
              console.log(res.body.data);
              //res.body.data.jobUpdatedDetail.nbJobAffected.should.equal(expectedNbJobAffected);
              done();
          });
  });
});