const config = require('../../configs/environnement/config');
const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');
const faker = require('faker');
const particularModel = require('../../configs/models/particular');
const should = require('chai').should();

describe('must_empty_database', function () {
    console.log('prepare of TU');
    before(function (done) {
        async function clearCollections() {
            const modelPath = path.join(__dirname, '../../configs/models');
            fs.readdirSync(modelPath).forEach(async function (modelFile) {
                let baseName = path.basename(modelFile, '.js');
                let currentModelPath = '../../configs/models/' + baseName; 
                let currentModel = require(currentModelPath);
                await currentModel.deleteMany({});
              })
        }
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.databaseUri,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                },
                function (err) {
                    if (err){
                        console.log(err);
                    }
                });
        }
        clearCollections().then(async()=>{
            console.log("after clear collections function");
            let phoneNumber = 699820047
            let gender = phoneNumber % 2 === 0 ? "Man" : "Woman";
            let state = phoneNumber %2 === 1 ? "employee" : "employer";
            for (let i = 0; i < 10; i++) {
                let fakee = new particularModel({
                    surname: faker.name.firstName(),
                    name: faker.name.lastName(),
                    description: faker.lorem.text(),
                    phoneNumber: {"value": phoneNumber},
                    email: {"value": faker.internet.email()},
                    valid: false,
                    gender: gender,
                    schoolLevel: {"level": "bac", "diplomaYear": 2014},
                    password: global.password,
                    software: ["eclipse"],
                    language: [{"value": "English", "level": "beginner"}, {"value": "French", "level": "maternal"}],
                    country: "cameroon",
                    town: faker.address.city(),
                    street: faker.address.streetName(),
                    referenceStreet: faker.address.streetAddress(),
                    state: [state],
                    birthday: "1999-03-15"
                });
                await fakee.save();
                phoneNumber = phoneNumber + 1;
            }
        });
        done();
    });

    describe(' Var env should be defined', () => {
        let test = -1;
        it('database env test shoud return 2', () => {
            if (config.databaseUri && config.databaseName) {
                test = 2;
            }
            test.should.be.equal(2);
        });
        it('jwt env test shoud return 3', () => {
            if (config.jwt_secret && config.jwt_expiration_in_seconds && config.sr) {
                test = 3;
            }
            test.should.be.equal(3);
        });
        it('mailgun test shoud return 4', () => {
            if (config.mailgun_apikey && config.mailgun_domain && config.mailgun_host) {
                test = 4;
            }
            test.should.be.equal(4);
        });
        it('sms key test shoud return 5', () => {
            if (config.user_api_sms && config.password_api_sms && config.phonenumbers) {
                test = 5;
            }
            test.should.be.equal(5);
        });
        it('rate limiter test shoud return 6', () => {
            if (config.rate_block_limit_seconds && config.rate_limit_in_milliseconds && config.redis_url) {
                test = 6;
            }
            test.should.be.equal(6);
        });
        it('IP_ADMIN test shoud return 7', () => {
            if (config.IP_ADMIN) {
                test = 7;
            }
            test.should.be.equal(7);
        });
        it(' API_KEY_GOOGLE_MAP test shoud return 8', () => {
            if (config.API_KEY_GOOGLE_MAP) {
                test = 8;
            }
            test.should.be.equal(8);
        });
        it(' NO MAIL VAR ENV test shoud return 9', () => {
            if (config.no_mail || Number(config.no_mail) === 0) {
                test = 9;
            }
            test.should.be.equal(9);
        });
        it(' CTO EMAIL test shoud return 10', () => {
            if (config.cto_mail) {
                test = 10;
            }
            test.should.be.equal(10);
        });
        it('LOG SENE test shoud return 11', () => {
            if (config.logsene_token) {
                test = 11;
            }
            test.should.be.equal(11);
        });
        it('PAYMENT TYPE FEES test shoud return 12', () => {
            if (config.payment_type_fees) {
                test = 12;
            }
            test.should.be.equal(12);
        });
        it(' JOB PRICE MIN test shoud return 13', () => {
            if (config.job_price_min !== undefined) {
                test = 13;
            }
            test.should.be.equal(13);
        });
        it(' prerender test shoud return 14', () => {
            if (config.prerender) {
                test = 14;
            }
            test.should.be.equal(14);
        });
    });
});
