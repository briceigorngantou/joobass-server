let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const baseUrl = '/api/v1/';
const urlPack = baseUrl + 'pack';


//create free pack
describe('create_pack', () => {
    it('should respond with a success message along with a single free pack that was added', (done) => {
        api.post(urlPack + '?lang=en')
            .send(
                {
                    "insurance": {
                        "allowInsurance": false,
                        "insurancePrice": 0
                    },
                    "price": 0,
                    "advantages": [
                        "Publication sur le site (Par l'utilisateur)",
                        "Accès gratuit à la plateforme"
                    ],
                    "allowAddOn": false,
                    "title": "Starter",
                    "description": "ideale pour gerer vous-même votre recrutement",
                    "level": {
                        "levelType": "One"
                    },
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
                global.packFreeId = res.body.data.id;
                console.log(packFreeId);
                done();
            });
    });
});

//create level 2 pack
describe('create_pack_level_2', () => {
    it('should respond with a success message along with a single  pack that was added', (done) => {
        api.post(urlPack + '?lang=en')
            .send(
                {
                    "insurance": {
                        "allowInsurance": false,
                        "insurancePrice": 0
                    },
                    "price": 10000,
                    "advantages": [
                        "Publication sur le site (Par l'utilisateur)",
                        "Accès gratuit à la plateforme",
                        "Visibilité augmentée (jusqu'à 7 fois plus de candidatures)"
                    ],
                    "allowAddOn": false,
                    "title": "Simple",
                    "description": "Augmentez la visibilité de votre offre auprès des talents et trouvez votre candidat idéal",
                    "level": {
                        "levelType": "Two",
                        "previousLevel": {
                            "$oid": "63820a64a927f27064853847"
                        }
                    }
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
                done();
            });
    });
});

//create level 3 pack
describe('create_paid_pack', () => {
    it('should respond with a success message along with a single paid pack that was added', (done) => {
        api.post(urlPack + '?lang=en')
            .send(
                {
                    "insurance": {
                        "allowInsurance": true,
                        "insurancePrice": 10000
                    },
                    "price": 20000,
                    "advantages": [
                        "Publication sur le site (Par l'utilisateur)",
                        "Accès gratuit à la plateforme",
                        "Visibilité augmentée (jusqu'à 7 fois plus de candidatures)",
                        "Formulaire de mise en ligne",
                        "Trie des CV",
                        "Selection des candidats & réponse employeur",
                        "Entretiens JOBAAS SARL"
                    ],
                    "allowAddOn": false,
                    "title": "Complete",
                    "description": "Faites vous accompagner et rencontrez seulement les meilleurs candidats à votre offre",
                    "level": {
                        "levelType": "Three",
                        "previousLevel": {
                            "$oid": "63821368f5ab0b4d3841ba76"
                        }
                    },
                    "__v": 0
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
                global.packPaidId = res.body.data.id;
                done();
            });
    });
});

//create level 2 pack
describe('create_personalized_pack', () => {
    it('should respond with a success message along with a single personalized pack that was added', (done) => {
        api.post(urlPack + '?lang=en')
            .send(
                {
                    "insurance": {
                        "allowInsurance": true,
                        "insurancePrice": 20000
                    },
                    "price": 30000,
                    "advantages": [
                        "Publication sur le site (Par l'utilisateur)",
                        "Accès gratuit à la plateforme",
                        "Visibilité augmentée (jusqu'à 7 fois plus de candidatures)",
                        "Formulaire de mise en ligne",
                        "Trie des CV",
                        "Selection des candidats & réponse employeur",
                        "Entretiens JOBAAS SARL",
                        "Planification des entretiens employeur",
                        "Accompagnement client",
                        "Demande personnalisée"
                    ],
                    "allowAddOn": true,
                    "title": "Premium",
                    "description": "Choisissez cette formule pour un recrutement clé en main",
                    "level": {
                        "levelType": "Four",
                        "previousLevel": {
                            "$oid": "6382155d5ac88567a0ed3691"
                        }
                    },
                    "__v": 0
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
                global.packPersonalizedId = res.body.data.id;
                done();
            });
    });
});

