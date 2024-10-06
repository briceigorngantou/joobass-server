let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const resource = 'evaluation';
const baseUrl = '/api/v1/particular/me/';
const url = baseUrl + resource;
global.evaluationId = "";
global.evluationId2 = "";


//test insertion for an evaluation of employee by employer
describe('POST '+url, () => {
    it('should respond with a success message along with a single evaluation that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "evaluator": global.idJobProvider,
                    "job": global.joBid,
                    "jobComment": "very Hard Job",
                    "netPromoterScore": 4,
                    "serviceGrade":3,
                    "state": "resolved"
                }).set('authorization', 'Bearer ' + global.token)
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
                res.body.message.should.eql('new evaluation was created');

                global.evaluationId = res.body.data.id;
                done();
            });
    });
});

//test insertion for an evaluation of employer by employee
describe('POST '+url, () => {
    it('should respond with a success message along with a single evaluation that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "evaluator": global.idJober,
                    "job": global.joBid,
                    "jobComment": "I appreciate working with this job provider though it' was hard",
                    "netPromoterScore": 4,
                    "serviceGrade":2,
                    "state": "resolved"
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
                res.body.message.should.eql('new evaluation was created');

                global.evaluationId2 = res.body.data.id;
                done();
            });
    });
});

//test can't evaluate twice 
describe('POST '+url, () => {
    it('should respond with a warning when user try to evaluate twice a jober', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "evaluator": global.idJobProvider,
                    "job": global.joBid,
                    "comment": "Twice",
                    "netPromoterScore": 4,
                    "serviceGrade":3,
                    "state": "resolved"
                }).set('authorization', 'Bearer ' + global.token)
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
                res.body.message.should.eql("You can't evaluate twice for  the same job.");


                done();
            });
    });
});

// get the evaluation list shouldn't be empty cause we just add one evaluation previously
describe('GET '+url, () => {
    it('should respond with a success message along with a get on all the  evaluations received that were added', (done) => {
        api.get(url + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //the numbers of evaluations objects should be not null
                done();
            });
    });
});


//get a single evaluation

describe('GET '+url+'/:id', () => {
    it('should respond with a success message along with a single get on a evaluation that was added', (done) => {
        api.get(url + '/' + global.evaluationId + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
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

//get a single evaluation with false id

describe('GET '+url+'/:id 2', () => {
    const fakeId = '5ds';
    it('should respond with a error message along with a single evaluation that wasn t added', (done) => {
        api.get(url + '/' + fakeId + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 404 status code
                res.status.should.equal(500);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check the respond code
                done();
            });
    });
});


//get all the evulations from  a specific jober
describe('GET /api/v1/particular/:userId/evaluations?lang=en', () => {
    it('should respond with a success message along with all evaluations from a specific jober ', (done) => {
        api.get('/api/v1/particular/' + global.idJober + '/evaluations?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check the message content
                res.body.message.should.eql('All the evaluations found for the particular id');

                done();
            });
    });
});


//update a evaluation  , here we first save the id of the evaluation from the previous get request
describe('UPDATE '+url, () => {
    const grade = 1;
    it('should respond with a success message along with a single evaluation that was updated', (done) => {
        api.put(url + '/' + global.evaluationId + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .send({
                "serviceGrade": grade
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');

                res.body.data.serviceGrade.should.equal(grade);
                done();
            });
    });
});



