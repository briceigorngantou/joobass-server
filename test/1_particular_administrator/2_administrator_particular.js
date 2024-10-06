let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'particular';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
const urladmin = baseUrl + 'administrator';
//token information
const urlToken = baseUrl + "auth/login";
// update validation status of all the particulars

//update a particular jobprovider the admin update the jobprovider's email.valid to true
describe('update_job_provider_by_using_admin_rights_with_first_admin', () => {
    it('should respond with a success message along with a single particular that was updated', (done) => {
        api.put(url + '/' + global.idJobProvider + '?lang=en')
            .send({
                "email": {
                    "value": global.jobProviderEmail,
                    "valid": true
                }
                , "valid": true,
                "identityCard": {
                    "valid": true,
                    "url": "https://c8.alamy.com/zoomsfr/9/cb6ed0d42892430a84e07c72b1bd35c6/ayedpc.jpg"
                },
                "phoneNumber": {
                    "value": 699820046,
                    "valid": true
                }
            })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.email.valid.should.equal(true);
                done();
            });
    });
});

//get user profile
describe('get_user_info_of_first_jobber_with_admin_rights_with_controller', () => {
    it('should respond with a success message that the specific particular wat got', (done) => {
        api.get(url + '/' + global.idJober).set('authorization', 'Bearer ' + global.tokenController)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                done();
            });
    });
});


//update a particular jober, the admin update the jober's email.valid to true
describe('update_boolean_email_valid_to_true_for_the_first_jober_with_first_admin_to_activate_account_jobber1', () => {
    it('should respond with a success message along with a single particular that was updated', (done) => {
        api.put(url + '/' + global.idJober + '?lang=en')
            .send({
                "email": {
                    "value": global.joberEmail,
                    "valid": true
                },
                "valid": true,
                "tags": ['Education', 'House'],
                "phoneNumber": {
                    "value": 699821047,
                    "valid": true
                },
                "profilePic": {"valid": true},
                "identityCard": {
                    "valid": true,
                    "url": "https://c8.alamy.com/zoomsfr/9/cb6ed0d42892430a84e07c72b1bd35c6/ayedpc.jpg"
                }
            })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.email.valid.should.equal(true);
                done();
            });
    });
});


//update a particular jober, the admin update the jober's email.valid to true
describe('add_new_role_employer_to_first_jober', () => {
    it('should respond with a success message along with a single update of the state of the jober', (done) => {
        api.put(urladmin + '/particular/' + global.idJober + '/role?lang=en')
            .send({
                "role": "employer"
            })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                done();
            });
    });
});


//update a particular jober2, the admin update the jober's email.valid to true
describe('update_boolean_email_valid_to_true_by_admin_to_activate_account_jobber2', () => {
    it('should respond with a success message along with a single particular that was updated', (done) => {
        api.put(url + '/' + global.idJober2 + '?lang=en')
            .send({
                "email": {
                    "value": global.jober2Email,
                    "valid": true
                },
                "profilePic": {"valid": true},
                "phoneNumber": {
                    "value": 656312801,
                    "valid": true
                },
                "valid": true
            })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.email.valid.should.equal(true);
                done();
            });
    });
});


//update a particular jober, the admin update the jober's email.valid to true
describe('update_boolean_email_valid_to_true_by_admin_to_activate_account_jobber3', () => {
    it('should respond with a success message along with a single particular that was updated', (done) => {
        api.put(url + '/' + global.idJober3 + '?lang=en')
            .send({
                "email": {
                    "value": global.jober3Email,
                    "valid": true
                },
                "valid": true,
                "tags": ['Education', 'House'],
                "phoneNumber": {
                    "value":697040469,
                    "valid": true
                },
                "profilePic": {"valid": true},
                "identityCard": {
                    "valid": true,
                    "url": "https://c8.alamy.com/zoomsfr/9/cb6ed0d42892430a84e07c72b1bd35c6/ayedpc.jpg"
                }
            })
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.email.valid.should.equal(true);
                done();
            });
    });
});

//get the token JobProvider
describe('authenticate_jobprovider_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/particular?lang=en')
            .send({
                "email": global.jobProviderEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.token = res.body.data.accessToken;
                done();
            });
    });
});

//get the token Jober
describe('authenticate_first_jober_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/particular?lang=en')
            .send({
                "email": global.joberEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenJober = res.body.data.accessToken;
                done();
            });
    });
});

//get the token Jober2
describe('authenticate_second_jober_and_get_the_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/particular?lang=en')
            .send({
                "email": global.jober2Email,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenJober2 = res.body.data.accessToken;
                done();
            });
    });
});


//get the token Jober3
describe('authenticate_jober3_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/particular?lang=en')
            .send({
                "email": global.jober3Email,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenJober3 = res.body.data.accessToken;
                done();
            });
    });
});

describe('get_info_related_to_jobprovider_after_authentication', () => {
    it('should respond with a success message along with a single get on a particular that was added', (done) => {
        api.get(url + '/profile/me').set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check the description is cleaned
                //res.body.data.particular.description.should.to.not.contain(global.jobProviderEmail);
                //res.body.data.particular.description.should.to.not.contain(global.surnameJobProvider);
                done();
            });
    });
});


//UPDATE  particular
describe('update_the_profession_of_jobprovider_by_himself', () => {
    it('should respond with a success message along with a single put on a particular that was added', (done) => {
        api.put(url + '/profile/me?lang=en').set('authorization', 'Bearer ' + global.token)
            .send({"profession": "Engineer"})
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.message.should.equal('particular was updated');
                done();
            });
    });
});



//UPADTE field isNotified

describe('update_the_field_isNotified_by_himself', () => {
    it('should respond with a success message along with a single put on a particular.isNotified that was updated', (done) => {
        api.put(url + '/notify/me?lang=en').set('authorization', 'Bearer ' + global.token)
            .send({"isNotified": "false"})
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "updated")
                console.log(" res " + res.body.message);
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.message.should.equal('the field isNotified was updated');
                done();
            });
    });
});
