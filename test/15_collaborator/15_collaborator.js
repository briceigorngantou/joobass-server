const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'collaborator';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;

global.nameJobaasCollaborator = "Doline";
global.surnameJobaasCollaborator = "Touko";
global.phoneNumberJobaasCollaborator = 237501697526
global.emailJobaasCollaborator = "touko.doline.fake@gmail.com"
global.professionJobaasCollaborator = "Tech Lead";
global.DomainJobaasCollaborator = "IT";
global.statusJobaasCollaborator = "Salarié";
global.townJobaasCollaborator = "Rouen";
global.streetJobaasCollaborator = "Rue de Lappe, 60231";
global.CountryJobaasCollaborator = "France";
global.birthdayJobaasCollaborator = "1996-07-08";
global.startedDateCompany = "2021-03-05";


global.nameJobaasCollaborator1 = "Charles";
global.surnameJobaasCollaborator1 = "Xavier de Bamenda";
global.phoneNumberJobaasCollaborator1 = 237516012546
global.emailJobaasCollaborator1 = "Charles.Xavier-de-bamenda.fake.@gmail.com"
global.professionJobaasCollaborator1 = "Business developer";
global.DomainJobaasCollaborator1 = "Commercial";
global.statusJobaasCollaborator1 = "Stagiaire";
global.townJobaasCollaborator1 = "Bamenda";
global.streetJobaasCollaborator1 = "Boulevard de la paix";
global.CountryJobaasCollaborator1 = "Cameroun";
global.birthdayJobaasCollaborator1 = "1996-07-08";
global.startedDateCompany1 = "2021-03-05";




//test admin add a collaborator
describe('create_collaborator_record_by_admin', () => {
    it('should respond with a success message along with a single collaborator that was added', (done) => {
        api.post(url + '/').set('authorization', 'Bearer ' + global.tokenAdmin)
            .send(
                {
                    "name": global.nameJobaasCollaborator,
                    "surname": global.surnameJobaasCollaborator,
                    "profession" : global.professionJobaasCollaborator,
                    "Domaine": global.DomainJobaasCollaborator1,
                    "phoneNumber": {"value": global.phoneNumberJobaasCollaborator},
                    "email": {"value": global.emailJobaasCollaborator},
                    "gender": "Woman",
                    "country": global.CountryJobaasCollaborator,
                    "town": global.townJobaasCollaborator,
                    "street": global.streetJobaasCollaborator,
                    "status": global.statusJobaasCollaborator,
                    "birthday": global.birthdayJobaasCollaborator,
                    "startDateInCompany": global.startedDateCompany,
                    "isPaid" : true,
                    "monthlyWage" : 200000,
                    "currency" : "XAF",
                    "avantages": "transport mensuel de 10000 Fcfa; 1.5 jours de congés payés par mois travaillés; Bonne mutuelle; Primes sur performance"
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
                global.idJobaasCollaborator = res.body.data.id;

                done();
            });
    });
});


//test rh add a collaborator
describe('create_collaborator_record_by_rh', () => {
    it('should respond with a success message along with a single collaborator that was added', (done) => {
        api.post(url + '/').set('authorization', 'Bearer ' + global.tokenRH)
            .send(
                {
                    "name": global.nameJobaasCollaborator1,
                    "surname": global.surnameJobaasCollaborator1,
                    "profession" : global.professionJobaasCollaborator1,
                    "Domaine": global.DomainJobaasCollaborator1,
                    "phoneNumber": {"value": global.phoneNumberJobaasCollaborator1},
                    "email": {"value": global.emailJobaasCollaborator1},
                    "gender": "Man",
                    "country": global.CountryJobaasCollaborator1,
                    "town": global.townJobaasCollaborator1,
                    "street": global.streetJobaasCollaborator1,
                    "status": global.statusJobaasCollaborator1,
                    "birthday": global.birthdayJobaasCollaborator1,
                    "startDateInCompany": global.startedDateCompany1,
                    "isPaid" : false,
                    "monthlyWage" : 0,
                    "currency" : "XAF",
                    "avantages": "Crédit Internet et appel de 20000 fcfa par mois; Frais de transport de 15000 par mois; Bonne mutuelle; Primes sur performance"
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
                global.idJobaasCollaborator1 = res.body.data.id;

                done();
            });
    });
});

//test rh get a collaborator
describe('get_collaborator_record_by_rh', () => {
    it('should respond with a success message along with a single collaborator that was retrieved', (done) => {
        api.get(url + '/' + global.idJobaasCollaborator).set('authorization', 'Bearer ' + global.tokenRH)
            .send({})
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
                res.body.data._id.should.equal(global.idJobaasCollaborator)

                done();
            });
    });
});

//test admin update a collaborator
describe('update_collaborator_record_by_rh', () => {
    it('should respond with a success message along with a single collaborator that was updated', (done) => {
        api.put(url + '/' + global.idJobaasCollaborator1).set('authorization', 'Bearer ' + global.tokenAdmin)
            .send({"status": "Salarié", "monthlyWage": 50000})
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
                res.body.data.monthlyWage.should.equal(50000)

                done();
            });
    });
});


//TODO : Need to modify the policy of rights to make them mutual. Today a commercial can login in backoffice and access (get/delete/create/update) other collaborators data for example because he has admin/sup admin rights. 
//This needs to change so only users with RH and above rights can access all collaborator data


//test other role to add a collaborator
/*describe('create_collaborator_record_by_other', () => {
    it('should respond with an error message along that the role is neither Rh neither admin', (done) => {
        api.post(url + '/').set('authorization', 'Bearer ' + global.tokenRH)
            .send(
                {
                    "name": global.nameJobaasCollaborator1,
                    "surname": global.surnameJobaasCollaborator1,
                    "profession" : global.professionJobaasCollaborator1,
                    "phoneNumber": {"value": global.phoneNumberJobaasCollaborator1},
                    "email": {"value": global.emailJobaasCollaborator1},
                    "gender": "Man",
                    "country": global.CountryJobaasCollaborator1,
                    "town": global.townJobaasCollaborator1,
                    "street": global.streetJobaasCollaborator1,
                    "status": global.statusJobaasCollaborator1,
                    "birthday": global.birthdayJobaasCollaborator1,
                    "startedDateCompany": global.startedDateCompany1,
                    "isPaid" : false,
                    "monthlyWage" : 0,
                    "currency" : "XAF",
                    "avantages": "Crédit Internet et appel de 20000 fcfa par mois; Frais de transport de 15000 par mois; Bonne mutuelle; Primes sur performance"
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
});*/