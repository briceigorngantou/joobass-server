const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'particular/me/experience';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
//token information
const urlToken = baseUrl + "auth/login";

//experience 1
global.experiencecompany = 'Example Company';
global.experiencetitle = 'Example Title';
global.experiencedescription = 'Example Description';
global.experienceTown = 'Garoua';

global.experienceId = "";
global.experienceId2 = "";
global.experienceId3 = "";


//create experience

//test particular insertion
describe('create_first_experience_for_first_employee', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "company": "SOCIETE GENERALE",
                    "title": "Data engineer",
                    "description": "description",
                    "tags": [],
                    'startDate': '2020-03-13',
                    'endDate': '2020-05-13',
                    "town": "Douala"
                })
            .set('authorization', 'Bearer ' + global.tokenJober)
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
                global.experienceId = res.body.data.id;
                done();
            });
    });
});

//test particular insertion
describe('create_second_experience_for_first_employee', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "company": "CAPGEMINI",
                    "title": "Data scientist",
                    "description": "description 2",
                    "tags": ["Web_service"],
                    'startDate': '2020-03-13',
                    'endDate': '2020-05-13',
                    "town": "Douala"
                })
            .set('authorization', 'Bearer ' + global.tokenJober)
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
                global.experienceId2 = res.body.data.id;
                done();
            });
    });
});

describe('create_third_experience_for_first_employee', () => {
    it('should respond with a success message along with a single experience that was added', (done) => {
        api.post(url + '?lang=en').set('authorization', 'Bearer ' + global.tokenJober)
            .send({
                'employee' : global.idJober,
                'company' : global.experiencecompany,
                'title' : global.experiencetitle,
                'description' : global.experiencedescription,
                'tags' : ['Education'],
                'startDate' : Date.now(),
                'endDate' : Date.now(),
                'town' : global.experienceTown,
                'isVisible' : true
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
                global.experienceId3 = res.body.data.id;
                done();
            });

    }
    );
});

//update experience 

describe('update_experience', () => {
    //console.log('global id update :' + global.experienceId);
    it('should respond with a success message along with a single experience that was updated', (done) => {
      api.put(url + '/' + global.experienceId + '?lang=en')
          .set('authorization', 'Bearer ' + global.tokenJober)
          .send({
            'town': 'Yaoundé',
            'title': 'Test',
          })
          .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            // (indicating that something was "updated")
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            // the return object should have the same id that the one the use to get it
            res.body.data.town.should.equal('Yaoundé');
            res.body.data.title.should.equal('Test');  
            done();
          });
    });
  });

//read experience by id

describe('get_experience_by_id', () => {
    it('should respond with a success message along with a get on a specific number of experience that were added using limit parameter', (done) => {
      api.get(url + '/' + global.experienceId + '?lang=en')
          .set('authorization', 'Bearer ' + global.tokenJober)
          .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            done();
          });
    });
});

//read all experiences

describe('get_all_experiences', () => {
  it('should respond with a success message along with a get all experiences', (done) => {
      api.get(url + '?lang=en').set('authorization', 'Bearer ' + global.tokenJober)
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
              res.body.data.experiences.length.should.not.equal(0);
              done();
          });
  });
});