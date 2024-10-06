let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'particular';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
//token information
const urlToken = baseUrl + "auth/login";


//particulars infos
//Job Provicer
global.jobProviderEmail = "leonel@yahoo.fr"; //jobaas.cm";//"@yahoo.fr";
global.nameJobProvider = "ELANGA NKOO";
global.surnameJobProvider = "Steve Patrick Lionel";

//jober
global.joberEmail = "elangal@3il.fr";//jobaas.cm";//"gmail.com";
global.nameJober = "Ulrich";
global.surnameJober = "BAZOU";
global.password = "string9S#";

//jober2
global.jober2Email = "stevepatricklionel.elanga@gmail.com";//"gmail.com";
global.nameJober2 = "NKO'O";
global.surnameJober2 = "Steve";


//jober3
global.jober3Email = "zendaya@gmail.com";//"gmail.com";
global.nameJober3 = "Zendaya";
global.surnameJober3 = "NKAM";

//identifiers to insert  while testing  Job, Application and so on.
global.idJobProvider = "";
global.idJober = "";
global.idJober2 = "";
global.idJober3 = "";
global.idAdmin = "";
global.idController = "";

//Token
global.token = "";
global.tokenJober = "";
global.tokenJober2 = "";
global.tokenJober3 = "";
global.tokenAdmin = "";
global.tokenController = "";
global.jobParticularId2 = "";

// affiliation 
global.codeAffiliation = "";
global.falseCodeAffiliation = "testFauxCode";

//transactionsId
global.transactionIdFirstPayment = "";
global.transactionIdSecondPayment = "";
global.transactionIdFinalPayment = "";

//test particular insertion
describe('create_first_jobprovider', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": global.nameJobProvider,
                    "surname": global.surnameJobProvider,
                    "description": "Je suis " + global.nameJobProvider + " " + global.surnameJobProvider + " contacte  moi à  " + global.jobProviderEmail,
                    "MoneyAccount": [33786177031],
                    "phoneNumber": {"value": 699820046},
                    "email": {"value": global.jobProviderEmail},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac", "diplomaYear": 2014},
                    "password": global.password,
                    "software": ["eclipse"],
                    "language": [{"value": "English", "level": "beginner"}, {"value": "French", "level": "maternal"}],
                    "country": "cameroon",
                    "town": "Bafoussam",
                    "street": "Explosif",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["employer"],
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
                global.idJobProvider = res.body.data.id;
                done();
            });
    });
});

//test affiliation code existence
describe('check_affiliationcode_first_jobprovider', () => {
    it('should respond with a success message along with a get on single particular', (done) => {
        api.get(url+"/"+global.idJobProvider+'?lang=en')
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
                res.body.data.particular.affiliation.code.should.be.not.empty ;             
                global.codeAffiliation = res.body.data.particular.affiliation.code;
                done();
            });
    });
});


//test  add a second particular insertion
describe('create_first_jober', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": global.nameJober,
                    "surname": global.surnameJober,
                    "description": "Je suis " + global.nameJober + " " + global.surnameJober + "contact me at " + global.joberEmail,
                    "MoneyAccount": [33786177030],
                    "phoneNumber": {"value": 699821047},
                    "email": {"value": global.joberEmail},
                    "driver_permit": {"vehicle": "car", "date": 1999, "category": "A"},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+2", "diplomaYear": 2014},
                    "profilePic": null,
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["employee"],
                    "profession": "student",
                    "skills": ["programmation"],
                    "software": ["eclipse"],
                    "birthday": "1999-03-15",
                    "affiliation":{from:global.codeAffiliation}
                })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                global.idJober = res.body.data.id;
                done();
            });
    });
});

//test  add a third particular insertion with invalid afficliation code. Subscription should not be completed
describe('create_first_jober', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": "Doe",
                    "surname": "John",
                    "description": "Je suis  John doe contact me at fausse.adresse@gmail.com",
                    "MoneyAccount": [33670265189],
                    "phoneNumber": {"value": 670265189},
                    "email": {"value": "fausse.adresse@gmail.com"},
                    "driver_permit": {"vehicle": "car", "date": 1999, "category": "A"},
                    "valid": false,
                    "gender": "Man",
                    "schoolLevel": {"level": "bac+2", "diplomaYear": 2014},
                    "profilePic": null,
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Douala",
                    "street": "Jouvence",
                    "referenceStreet": "Collège Victor Hugo",
                    "state": ["employee"],
                    "profession": "student",
                    "skills": ["programmation"],
                    "software": ["eclipse"],
                    "birthday": "1999-03-15",
                    "affiliation":{from:global.falseCodeAffiliation}
                })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(400);
                // the response should be JSON
                res.type.should.equal('application/json');
                done();
            });
    });
});


//test affiliation incrementation after previous registration  insertion
describe('check_affiliation.count_increase_due_previous_registration', () => {
    it('should respond with a success message along with a get on single particular', (done) => {
        api.get(url+"/"+global.idJobProvider+'?lang=en')
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
                res.body.data.particular.affiliation.count.should.equal(1);
                done();
            });
    });
});

//test  add a fourth particular insertion
describe('create_second_jober', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": global.nameJober2,
                    "surname": global.surnameJober2,
                    "description": "Je suis " + global.nameJober2 + " " + global.surnameJober2 + "contact me at " + global.jober2Email,
                    "MoneyAccount": [33786177033],
                    "phoneNumber": {"value": 656312801},
                    "email": {"value": global.jober2Email},
                    "valid": false,
                    "gender": "Man",
                    "tags": ['Others'],
                    "schoolLevel": {"level": "bac+3", "diplomaYear": 2013},
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["employee"],
                    "profession": "teacher",
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
                global.idJober2 = res.body.data.id;
                done();
            });
    });
});

//test  add a fifth particular insertion
describe('create_an_user_with_invalid_password', () => {
    it('should respond with a message that password is not valid along with the form filled by the user', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": "Osef",
                    "surname": "Like",
                    "description": "Je suis un faux utilisateur",
                    "MoneyAccount": [33999999999],
                    "phoneNumber": {"value": 237999999999},
                    "email": {"value": "osef_like_really@gmail.com"},
                    "valid": false,
                    "gender": "Man",
                    "tags": ['Others'],
                    "schoolLevel": {"level": "bac+3", "diplomaYear": 2013},
                    "password": "string",
                    "country": "cameroon",
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège Saint Thomas",
                    "state": ["employee"],
                    "profession": "teacher",
                    "birthday": "1999-03-15"
                }
            )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(400);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                // res.body.message.should.eql('Invalid password. there should be at least 8 characters ' +
                //     'and at least one number, one capital and lower character, ' +
                //     'and one no alphanumerique character among [!%#_?@]');
                done();
            });
    });
});

// non valid mail  cannot connect
//get the token Jober
describe('authenticate_user_with_boolean_email_at_false', () => {
    it('should respond with a warning  when non valid  jober  request for token with good credential', (done) => {
        api.post(urlToken + '/particular?lang=en')
            .send({
                "email": global.jober2Email,
                "password": global.password
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(403);
                res.type.should.equal('application/json');
                done();
            });
    });
});


//test  add a fifth particular insertion
describe('create_third_jobber', () => {
    it('should respond with a success message along with a single particular that was added', (done) => {
        api.post(url + '?lang=en')
            .send(
                {
                    "name": global.nameJober3,
                    "surname": global.surnameJober3,
                    "description": "Je suis " + global.nameJober3 + " " + global.surnameJober3 + "contact me at " + global.jober3Email,
                    "MoneyAccount": [33786177033],
                    "phoneNumber": {"value":697040469},
                    "email": {"value": global.jober3Email},
                    "valid": false,
                    "gender": "Woman",
                    "tags": ['Others'],
                    "schoolLevel": {"level": "bac+3", "diplomaYear": 2013},
                    "password": global.password,
                    "country": "cameroon",
                    "town": "Douala",
                    "street": "Boulangerie Alfred Saker",
                    "referenceStreet": "Collège François Xavier Vogt",
                    "state": ["employee"],
                    "profession": "teacher",
                    "birthday": "1998-10-15"
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
                global.idJober3 = res.body.data.id;
                done();
            });
    });
});

