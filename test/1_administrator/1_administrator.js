let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const baseUrl = '/api/v1/';
const urladmin = baseUrl + 'administrator';
//token information
const urlToken = baseUrl + "auth/login";


//controller
global.controllerEmail = "gbouki@jobaas.cm";//yahoo.fr";//"gmail.com";
global.nameController = "Géraud";
global.surnameController = "BOUKI";

//   Admin Prod
global.adminProdEmail = "contact@jobaas.cm";//"gmail.com";
global.nameProdAdmin = "Kylian";
global.surnameProdAdmin = "NYAMA";

global.phoneNumberProdAdmin = 33786177941;


// Admin
global.adminEmail = "jordanet@jobaas.cm";//"gmail.com";
global.nameAdmin = "Jordane";
global.surnameAdmin = "TSAFACK";
global.password = "strong9S#";
global.phoneNumberAdmin = 33786177040;

// RH
global.rhEmail = "rh@jobaas.cm";
global.nameRh = "Vanelle";
global.surnameRh = "WAKAM";
global.phoneNumberRh = 237655794689;
global.tokenRH = "";

//Commercial
global.commercialEmail = "sales_test@jobaas.cm";
global.nameCommercial = "Jean";
global.surnameCommercial = "BeauParleur";
global.phoneNumberCommercial = 237697513246;
global.tokenCommercial = "";

//Communication member
global.communication_memberEmail = "communicationTeam_test@jobaas.cm";
global.communication_memberName = "Annick";
global.communication_memberSurname = "Badot";
global.communication_memberPhoneNumber = 237684952317;
global.communication_memberToken = "";



//identifiers to insert  while testing  Job, Application and so on.
global.idAdmin = "";
global.idController = "";
global.idRH = "";
global.idCommercial = "";

//packs
global.packFreeId = "";
global.packPaidId = "";
global.packPersonalizedId = "";



//create administrator admin level controller
describe('create_administrator_controller', () => {
    it('should respond with a success message along with a single admin that was added', (done) => {
        console.log(" create admin api url : " + urladmin);
        api.post(urladmin + '?lang=en')
            .send(
                {
                    "name": global.nameAdmin,
                    "surname": global.surnameAdmin,
                    "phoneNumber": {"value": global.phoneNumberAdmin},
                    "email": {"value": global.adminEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "profilePic": null,
                    "password": global.password,
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["admin"],
                    "birthday": "1999-03-15"
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
                global.idAdmin = res.body.data.id;

                done();
            });
    });
});


//create super Admin 
describe('create_second_admin', () => {
    it('should respond with a success message along with a single admin that was added', (done) => {
        api.post(urladmin + '?lang=en')
            .send(
                {
                    "name": global.nameProdAdmin ,
                    "surname": global.surnameProdAdmin,
                    "phoneNumber": {"value":global.phoneNumberProdAdmin},
                    "email": {"value": global.adminProdEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "profilePic": null,
                    "password": global.password,
                    "town": "Douala",
                    "street": "Tamdja ",
                    "referenceStreet": "Eglise Saint Jean",
                    "state": ["admin"],
                    "birthday": "1999-03-15"
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
                global.idAdminProd = res.body.data.id;

                done();
            });
    });
});

//authenticate admin and get the token
describe('authenticate_second_admin_and_get_token', () => {
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


//update a particular admin prod, valid to true
describe('set_second_admin_email_boolean_valid_to_true', () => {
    it('should respond with a success message along with a single admin that was updated', (done) => {
        api.put(urladmin + '/' +global.idAdminProd + '?lang=en')
            .send({
                "email": {
                    "value": "contact@jobaas.cm",
                    "valid": true
                },
                "valid": true,
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
})


//update a particular admin, valid to true
describe('set_admin_email_boolean_valid_to_true', () => {
    it('should respond with a success message along with a single admin that was updated', (done) => {
        api.put(urladmin + '/' + global.idAdmin + '?lang=en')
            .send({
                "email": {
                    "value": "jordanet@jobaas.cm",
                    "valid": true
                },
                "valid": true,
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

//test admin add a rh
describe('create_administrator_rh', () => {
    it('should respond with a success message along with a single admin that was added', (done) => {
        api.post(urladmin + '/createRH?lang=en').set('authorization', 'Bearer ' + global.tokenAdmin)
            .send(
                {
                    "name": global.nameRh,
                    "surname": global.surnameRh,
                    "phoneNumber": {"value": global.phoneNumberRh},
                    "email": {"value": global.rhEmail},
                    "valid": true,
                    "gender": "Woman",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "profilePic": null,
                    "password": global.password,
                    "town": "Douala",
                    "street": "Carrefour nkolbisson",
                    "referenceStreet": "Carrefour nkolbisson",
                    "state": ["rh"],
                    "birthday": "1999-03-15"
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
                global.idRH = res.body.data.id;

                done();
            });
    });
});

//update a rh to valid email and status
describe('update_email_of_rh_admin_by_first_admin', () => {
    it('should respond with a success message along with a single controller that was updated', (done) => {
        api.put(urladmin + '/' + global.idRH + '?lang=en')
            .send({
                "email": {
                    "value": global.rhEmail,
                    "valid": true
                },
                "phoneNumber": {
                    "value": global.phoneNumberRh,
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

                done();
            });
    });
});


//authenticate rh and get the token
describe('authenticate_rh_admin_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/administrator?lang=en')
            .send({
                "email": global.rhEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenRH = res.body.data.accessToken;
                done();
            });
    });
});


// test admin add a controller
describe('create_controller_admin_by_first_admin', () => {
    it('should respond with a success message along with a single controller that was added', (done) => {
        api.post(urladmin + '/createController?lang=en').set('authorization', 'Bearer ' + global.tokenAdmin)
            .send(
                {
                    "name": nameController,
                    "surname": surnameController,
                    "phoneNumber": {"value": 33786177034},
                    "email": {"value": global.controllerEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "password": global.password,
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["controller"],
                    "birthday": "1999-03-15"
                }
            )
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
                global.idController = res.body.data.id;
                done();
            });
    });
});

// test rh add a commercial
describe('create_commercial_admin_by_rh', () => {
    it('should respond with a success message along with a single controller that was added', (done) => {
        api.post(urladmin + '/createCommercial?lang=en').set('authorization', 'Bearer ' + global.tokenRH)
            .send(
                {
                    "name": global.nameCommercial,
                    "surname": global.surnameCommercial,
                    "phoneNumber": {"value": global.phoneNumberCommercial},
                    "email": {"value": global.commercialEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "password": global.password,
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["commercial"],
                    "birthday": "1999-03-15"
                }
            )
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
                global.idCommercial = res.body.data.id;
                done();
            });
    });
});

// test rh add a communication member
describe('create_communication_user_admin_by_rh', () => {
    it('should respond with a success message along with a single communication member that was added', (done) => {
        api.post(urladmin + '/createCommunicationMember?lang=en').set('authorization', 'Bearer ' + global.tokenRH)
            .send(
                {
                    "name": global.communication_memberName,
                    "surname": global.communication_memberSurname,
                    "phoneNumber": {"value": global.communication_memberPhoneNumber},
                    "email": {"value": global.communication_memberEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "password": global.password,
                    "town": "Douala",
                    "street": "Bonapriso derrière Casino",
                    "referenceStreet": "En face de l'opium",
                    "state": ["communication"],
                    "birthday": "1999-03-15"
                }
            )
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
                global.idCommunicationUser = res.body.data.id;
                done();
            });
    });
});


// test rh add a rh
describe('create_rh_admin_by_rh', () => {
    it('should respond with a error message because only admin and supAdmin can create rh', (done) => {
        api.post(urladmin + '/createRH?lang=en').set('authorization', 'Bearer ' + global.tokenRH)
            .send(
                {
                    "name": "test",
                    "surname": "test",
                    "phoneNumber": {"value": 237561284966},
                    "email": {"value": "test@jobaas.cm"},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+4", "diplomaYear": 2013},
                    "password": global.password,
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["commercial"],
                    "birthday": "1999-03-15"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(403);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                done();
            });
    });
});

//update a commercial to valid email and status
describe('update_email_of_commercial_admin_by_first_admin', () => {
    it('should respond with a success message along with a single controller that was updated', (done) => {
        api.put(urladmin + '/' + global.idCommercial + '?lang=en')
            .send({
                "email": {
                    "value": global.commercialEmail,
                    "valid": true
                },
                "phoneNumber": {
                    "value": global.phoneNumberCommercial,
                    "valid": true
                },
                "valid": true,
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

//update a communication User to valid email and status
describe('update_email_of_commercial_admin_by_first_admin', () => {
    it('should respond with a success message along with a single controller that was updated', (done) => {
        api.put(urladmin + '/' + global.idCommunicationUser + '?lang=en')
            .send({
                "email": {
                    "value": global.communication_memberEmail,
                    "valid": true
                },
                "phoneNumber": {
                    "value": global.communication_memberPhoneNumber,
                    "valid": true
                },
                "valid": true,
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

//authenticate commercial and get the token
describe('authenticate_commercial_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/administrator?lang=en')
            .send({
                "email": global.commercialEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.tokenCommercial = res.body.data.accessToken;
                done();
            });
    });
});

//authenticate communication and get the token
describe('authenticate_communicationUser_and_get_token', () => {
    it('should respond with a success when request for token with good credential', (done) => {
        api.post(urlToken + '/administrator?lang=en')
            .send({
                "email": global.communication_memberEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                global.communication_memberToken = res.body.data.accessToken;
                done();
            });
    });
});

//update a particular controller to valid email and status
describe('update_email_of_controller_admin_by_first_admin', () => {
    it('should respond with a success message along with a single controller that was updated', (done) => {
        api.put(urladmin + '/' + global.idController + '?lang=en')
            .send({
                "email": {
                    "value": global.controllerEmail,
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

                done();
            });
    });
});

//get the controller's token
describe('authenticate_controller_admin_and_get_token', () => {
    it('should respond with success request for token with good credential', (done) => {
        api.post(urlToken + '/administrator?lang=en')
            .send({
                "email": global.controllerEmail,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(201);
                res.type.should.equal('application/json');
                // the JSON response body should have a
                //check the message content
                global.tokenController = res.body.data.accessToken;
                done();
            });
    });
});

describe('get_info_of_an_administrator_with_fake_id_by_first_admin', () => {
    const fakeId = '5ds';
    it('should respond with an error message along with a single administrator that was not  found', (done) => {
        api.get(urladmin + '/' + fakeId + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
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

describe('get_info_of_second_admin_id_by_first_admin', () => {
    it('should respond with good success of retrieved info', (done) => {
        api.get(urladmin + '/' + global.idAdminProd + '?lang=en')
            .set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                //check the respond code
                done();
            });
    });
});

