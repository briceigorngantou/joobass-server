/* eslint-disable max-len */
const chai = require('chai');
const server = require('../../server');
var XLSX = require("xlsx");
const processingUtils = require('../../common/utils/processing')
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'job';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
const urlAdmin = baseUrl + 'administrator';
let currentDate = new Date();
const commonStartDate = processingUtils.incrementDate(currentDate, 1);
const commonlastDateVisibility = processingUtils.incrementDate(currentDate, 4);
const commonEndDate = processingUtils.incrementDate(currentDate, 6);
const wronglastDateVisibility = processingUtils.incrementDate(currentDate, 90);
const date_fns = require('date-fns');

global.startDate = commonStartDate;
global.endDate = commonEndDate;
global.lastDateVisibility = commonlastDateVisibility;
global.wronglastDateVisibility = wronglastDateVisibility;
global.joBid = '';
global.joBid2 = '';
global.jobidtest = '';
global.jobSlug = '';
global.firstDateForPunctualJob = processingUtils.incrementDate(new Date(commonStartDate), 1);
global.secondDateForPunctualJob = processingUtils.incrementDate(new Date(commonStartDate), 2);
global.thirdDateForPunctualJob = processingUtils.incrementDate(new Date(commonStartDate), 3);
global.fourthDateForPunctualJob = processingUtils.incrementDate(new Date(commonStartDate), 4);
global.scrappedJobs = [];

var workbook = XLSX.readFile('test/files_test/jobInfo.xlsx');
var sheet_name_list = workbook.SheetNames;
var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
//company for scrappers
global.jobaasScrapperCompany = '';

// token information
// test job insertion
describe('create_job_bodyguard_for_jobprovider_by_admin', () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        .send({
          'town': 'Cap town',
          'street': 'Ludovic',
          'referenceStreet': 'Africa bank',
          'title': 'Garde du corps',
          'description': 'i\'m looking for a bodyguard for a party',
          'state': 'created',
          'employer': global.idJobProvider,
          'nbplaces': 3,
            'price': 10000,
          'typeEmployer': 'particular',
          'startDate': global.startDate,
            'packLevelId': global.packFreeId,
            'insuranceChecked': false,
          'frequency': {
            'isRegular': false,
            'listOfDates': [
              {
                'day': global.firstDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.secondDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.thirdDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
            ],
          },
          'endDate': global.endDate,
        }).set('authorization', 'Bearer ' + global.tokenAdmin)
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
          // check the message content
          res.body.message.should.contain('new job was created');
          global.joBid = res.body.data.id;
          global.jobSlug = res.body.data.slug;
          done();
        });
  });
});

describe('create_job_bodyguard_with_wrong_lastDateVisibility_by_admin', () => {
    it('should respond with a error message along with a single job that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                'town': 'Cap town',
                'street': 'Ludovic',
                'referenceStreet': 'Africa bank',
                'title': 'Garde du corps',
                'description': 'i\'m looking for a bodyguard for a party',
                'state': 'created',
                'employer': global.idJobProvider,
                'nbplaces': 3,
                'price': 10000,
                'typeEmployer': 'particular',
                'lastDateVisibility': global.wronglastDateVisibility,
                'startDate': global.startDate,
                'packLevelId': global.packFreeId,
                'insuranceChecked': false,
                'frequency': {
                    'isRegular': false,
                    'listOfDates': [
                        {
                            'day': global.firstDateForPunctualJob,
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                        {
                            'day': global.secondDateForPunctualJob,
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                        {
                            'day': global.thirdDateForPunctualJob,
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                    ],
                },
                'endDate': global.endDate,
            }).set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(400);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                // check the message content
                done();
            });
    });
});


describe('create_job_with_wrong_startDate_for_jobprovider_by_admin', () => {
    it('should respond with a message that startDate is not allowed', (done) => {
        api.post(url + '?lang=en')
            .send({
                'registrationDate': '2020-03-13T06:26:53.205Z',
                'town': 'Cap town',
                'street': 'Ludovic',
                'referenceStreet': 'Africa bank',
                'title': 'Garde du corps',
                'description': 'i\'m looking for a bodyguard for a party',
                'state': 'created',
                'employer': global.idJobProvider,
                'nbplaces': 3,
                'typeEmployer': 'particular',
                'price': 10000,
                'startDate': '2021-02-01',
                'packLevelId': global.packFreeId,
                'frequency': {
                    'isRegular': false,
                    'listOfDates': [
                        {
                            'day': '2020-03-13',
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                        {
                            'day': '2020-03-14',
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                        {
                            'day': '2020-03-15',
                            'timeSlots': [
                                {
                                    'startHour': '08:00',
                                    'endHour': '14:00',
                                },
                            ],
                        },
                    ],
                },
                'endDate': global.endDate,
            }).set('authorization', 'Bearer ' + global.tokenAdmin)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(400);
                // the response should be JSON
                done();
            });
    });
});

describe('create_job_cv_required_nb_place_one_by_admin', () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        .send({
          'town': 'Cap town',
          'street': 'Ludovic ',
          'referenceStreet': 'Africa bank',
          'title': 'Livraison de repas',
          'description': 'i\'m looking for someone that can handle the food delivery for my restaurant',
          'state': 'created',
          'cv_required': true,
            'price': 10000,
          'employer': global.idJobProvider,
          'nbplaces': 1,
            'packLevelId': global.packPaidId,
            'insuranceChecked': true,
            'jobFilesRequired': [
                "motivation_letter"
            ],
          'typeEmployer': 'particular',
          'startDate': global.startDate,
          'frequency': {
            'isRegular': false,
            'listOfDates': [
              {
                'day': global.firstDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.secondDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.thirdDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
            ],
          },
          'endDate': global.endDate,
        }).set('authorization', 'Bearer ' + global.tokenAdmin)
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
          // check the message content
          res.body.message.should.contain('new job was created');

          global.joBidtest = res.body.data.id;
          done();
        });
  });
});


// insert job 2

describe('create_job_baker_by_admin', () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        // eslint-disable-next-line linebreak-style
        .send({
          'town': 'Bafoussam',
          'street': 'Tamdja ',
          'referenceStreet': 'immeuble PMUC',
          'title': ' Boulangier',
          'description': 'Nous recherchons un boulangier afin de diriger la production et qualité du pain',
          'state': 'created',
          'employer': global.idJobProvider,
          'nbplaces': 3,
            'price': 10000,
          'typeEmployer': 'particular',
          'startDate': global.startDate,
            'packLevelId': global.packFreeId,
          'frequency': {
            'isRegular': false,
            'listOfDates': [
              {
                'day': global.firstDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.secondDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': global.thirdDateForPunctualJob,
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
            ],
          },
          'endDate': endDate,
        }).set('authorization', 'Bearer ' + global.tokenAdmin)
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
          // check the message content
          res.body.message.should.contain('new job was created');

          global.joBid2 = res.body.data.id;
          done();
        });
  });
});

// update a job  , here we first save the id of the job from the previous get request
describe('update_job_bodyguard_by_admin', () => {
  console.log('global id update :' + global.joBid);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put(url + '/' + global.joBid + '?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .send({
          'town': 'Douala',
          'title': 'secretaire',
          'nbplaces': 1,
          'isValid': true,
          'state': 'validated',
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
          res.body.data.town.should.equal('douala');
            res.body.data.title.should.equal('Secretaire');
          res.body.data.nbplaces.should.equal(1);

          done();
        });
  });
});


// validate a job
describe('validate_job_bodyguard_by_admin', () => {
  console.log('global id update :' + global.joBid);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put( urlAdmin+'/job/'+ global.joBid + '/validate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(400);
          // the response should be JSON
          res.body.message.should.contain(' already been validated');
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          done();
        });
  });
});

// validate a job
describe('validate_job_baker_by_admin', () => {
  console.log('global id update :' + global.joBidtest);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put(urlAdmin + '/job/' + global.joBidtest + '/validate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.body.message.should.contain('has been  validated and');
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          done();
        });
  });
});


// reject a job
describe('reject_job_baker_by_admin', () => {
  console.log('global id update :' + global.joBid2);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put( urlAdmin+'/job/'+ global.joBid2 + '/reject?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .send({
          'reason': ' You\'re not qualified',
        })
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          res.body.message.should.contain('has been rejected because');
          done();
        });
  });
});


describe('complete_job_baker_by_admin', () => {
  console.log('global id update :' +global.joBid2);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put(urlAdmin + '/job/' + global.joBid2+ '/jobDone?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.body.message.should.contain('We thank you for your confirmation');
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          done();
        });
  });
});


// get a single job
describe('get_info_job_body_guard_by_admin', () => {
  it('should respond with a success message along with a single get on a job that was added', (done) => {
    api.get(url + '/' + global.joBid + '?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
        // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          res.body.data.job.nbViews.should.not.equal(0);
          done();
        });
  });
});

// get a single job with the slug
describe('get_infos_job_with_slug_by_admin', () => {
  it('should respond with a success message along with a single get on a job that was added', (done) => {
    api.get(url + '/title_job/' + global.jobSlug + '?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
        // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          res.body.data.job._id.should.equal(global.joBid);
          done();
        });
  });
});


// get a single job with false id
describe('get_error_when_get_infos_of_job_with_fake_id_by_admin', () => {
  const fakeId = '5ds';
  it('should respond with a error message along with a single job that wasn t added', (done) => {
    api.get(url + '/' + fakeId + '?lang=en')
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
        // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(500);
          // the response should be JSON
          res.type.should.equal('application/json');
          // check the respond code
          done();
        });
  });
});


//TODO Check this unit test
describe('get_employees_of_job_baker_by_jobprovider', () => {
  it('should respond with a success message along with a get on a specific number of  jobs that were added using limit parameter', (done) => {
    api.get(url + '/' + global.joBid + '/employees?lang=en')
        .set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          // res.should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // global.joBid = res.body.data[0].id ;
          // the numbers of employee should be null cause there no application
          res.body.data.length.should.equal(0);
          done();
        });
  });
});

// insert scrapped jobs into our database with an admin account
// let cour_scrapped_job = {}
// let cour_req_body = {}
// let cour_date = new Date();
// console.log(global.jobaasScrapperCompany);

//test company insertion that will be the one logged as the author of scrapped jobs
describe('POST /api/v1/company', () => {
  it('should respond with a success message along with a single company that was added', (done) => {
      api.post('/api/v1/company' + '?lang=en')
          .send(
              {
                  "name": "Robin",
                  "surname": "ShareWoods",
                  "phoneNumber": {"value": 237676897123, "valid": true},
                  "email": {
                      "value": "JobaasScrapperCompany@gmail.com",
                      "valid": true
                  },
                  "valid": true,
                  "nameCompany": "JobaasScrapperCompany",
                  "description": "Alter ego de jobaas sarl chargé de scrapper les offres d'emploi sur d'autres sites",
                  "phoneNumberCompany": {"value": 237676897124},
                  "fiscalNumber": {"value": 1010},
                  "password": global.password,
                  "country": "cameroon",
                  "town": "Yaoundé",
                  "website": {
                      "value": "http://JobaasScrapperCompany.com",
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

              global.jobaasScrapperCompany = res.body.data.id;
              console.log(global.jobaasScrapperCompany);
              done();
          });
  });
});

let cour_date = new Date();
Array.from(Array(xlData.length).keys()).forEach(value => {
  describe('create_scrapped_job_offer_by_admin', () => {
    it('should respond with a message along with a single scrapped job was added or not due to presence of email adresses in the body', (done) => {
      if(xlData[value].emailsContact) {
        if (xlData[value].emailsContact.split(",").length !== 0 && xlData[value].emailsContact.split(",")!==[""]) {
          console.log(xlData[value]);
          console.log(xlData[value].emailsContact)
          api.post(url +'/scrappedJobs?lang=en')
              .send({
                'town': !xlData[value]["City"] ? "Cameroun" : xlData[value]["City"],
                'street': !xlData[value]["City"] ? "Cameroun" : xlData[value]["City"],
                'referenceStreet': !xlData[value]["City"] ? "Cameroun" : xlData[value]["City"],
                'title': xlData[value]["jobTitle"],
                'description': xlData[value]["jobDescription"],
                'state': 'created',
                'employer': global.idJobProvider,
                'nbplaces': 1,
                'price': 100000,
                'typeEmployer': 'entreprise',
                'startDate': new Date(cour_date.setDate(cour_date.getDate() + 28)),
                "lastDateVisibility": new Date(cour_date.setDate(cour_date.getDate() + 14)),
                'frequency': {
                  'isRegular': true,
                  'valueFrequency' : [
                    {day: "monday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
                    {day: "tuesday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
                    {day: "wednesday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
                    {day: "thursday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
                    {day: "friday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]}
                    ],
                },
                'endDate': new Date(cour_date.setDate(cour_date.getDate() + 393)),
                "sourceJobOffers": {
                  typeSourceJobOffer: "external",
                  nameSourceJobOffer: xlData[value]["website"],
                  urlSourceJobOffer: xlData[value]["url"]
                },
                "externalContactsJobOffer" : {
                  phoneNumber: !xlData[value]["phoneNumbers"] ? [] : xlData[value]["phoneNumbers"].split(";"),
                  emails: !xlData[value]["emailsContact"] ? [] : xlData[value]["emailsContact"].split(","),
                  nameEmployer: xlData[value]["Entreprise"],
                  ExternalpublicationDate: new Date(cour_date.setDate(cour_date.getDate() + 28)),
                },
                "employer": global.jobaasScrapperCompany
              }).set('authorization', 'Bearer ' + global.tokenAdmin)
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
                // check the message content
                res.body.message.should.contain('new job was created with scrapping');
                
                global.scrappedJobs.push(res.body.data.id);
                console.log("Nombre d'offres scrappées : " + String(global.scrappedJobs));
                done();
              });
        } else {
          console.log("pas d'adresse mail");
          console.log(xlData[value]);
          api.post(url + '/scrappedJobs?lang=en')
              // eslint-disable-next-line linebreak-style
              .send({
                "sourceJobOffers": {
                typeSourceJobOffer: "external",
                nameSourceJobOffer: xlData[value]["website"],
                urlSourceJobOffer: xlData[value]["url"]
              },
              "externalContactsJobOffer" : {
                phoneNumber: !xlData[value]["phoneNumbers"] ? [] : xlData[value]["phoneNumbers"].split(";"),
                emails: !xlData[value]["emailsContact"] ? [] : xlData[value]["emailsContact"].split(","),
                nameEmployer: xlData[value]["Entreprise"],
                ExternalpublicationDate: new Date(cour_date.setDate(cour_date.getDate() + 28)),
              },
              "employer": global.jobaasScrapperCompany})
              .set('authorization', 'Bearer ' + global.tokenAdmin)
              .end((err, res) => {
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(500);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                // check the message content
                res.body.message.should.contain('Job offer failed to be created because no email was available in the scrapped data');
                done();
              });
        }
      } else {
        api.post(url + '/scrappedJobs?lang=en')
        // eslint-disable-next-line linebreak-style
        .send({
              "sourceJobOffers": {
              typeSourceJobOffer: "external",
              nameSourceJobOffer: xlData[value]["website"],
              urlSourceJobOffer: xlData[value]["url"]
            },
            "externalContactsJobOffer" : {
              phoneNumber: !xlData[value]["phoneNumbers"] ? [] : xlData[value]["phoneNumbers"].split(";"),
              emails: !xlData[value]["emailsContact"] ? [] : xlData[value]["emailsContact"].split(","),
              nameEmployer: xlData[value]["Entreprise"],
              ExternalpublicationDate: new Date(cour_date.setDate(cour_date.getDate() + 28)),
            },
            "employer": global.jobaasScrapperCompany})
        .set('authorization', 'Bearer ' + global.tokenAdmin)
        .end((err, res) => {
          // there should be a 200 status code
          // (indicating that something was "created")
          res.status.should.equal(500);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          // check the message content
          res.body.message.should.contain('Job offer failed to be created because no email was available in the scrapped data');
          done();
        });
      }
        
    });
  });
});

// for (let jobNbr = 0; jobNbr < 5; jobNbr++) {
//   //common fields with job offers published by users xlData.length
//   //cour_scrapped_job = xlData[jobNbr];
//   cour_req_body["town"] = xlData[jobNbr]["City"];
//   cour_req_body["street"] = xlData[jobNbr]["City"];
//   cour_req_body["referenceStreet"] = xlData[jobNbr]["City"];
//   cour_req_body["title"] = xlData[jobNbr]["jobTitle"];
//   cour_req_body["description"] = xlData[jobNbr]["jobDescription"];
//   cour_req_body["state"] = "created";
//   cour_req_body["typeEmployer"] = "entreprise";
//   cour_req_body["nbplaces"] = 1
//   try{
//     cour_req_body["price"] = int(xlData[jobNbr]["salaire"]) > 0 ? int(xlData[jobNbr]["salaire"]) : 0;
//   } catch {
//     cour_req_body["price"] = 0;
//   }
//   cour_req_body["frequency"] = {
//         'isRegular': true,
//         'valueFrequency' : [
//           {day: "monday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
//           {day: "tuesday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
//           {day: "wednesday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
//           {day: "thursday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]},
//           {day: "friday", timeSlots:[{"startHour": "09:00", endHour: "17:30"}]}
//           ],
//       };
//   //see the dates (start date, end date and last visibility date)
//   try {
//     cour_req_body["startDate"] = (!xlData[jobNbr]["DeadlineForApplications"] || xlData[jobNbr]["DeadlineForApplications"]==="") ? date_fns.parse(xlData[jobNbr]["DeadlineForApplications"], 'dd-MM-yyyy', new Date()) : cour_date.setDate(cour_date.getDate() + 28) 
//     cour_req_body["endDate"] = new Date(cour_req_body["startDate"]).setDate(cour_date.getDate() + 365);
//     cour_req_body["lastDateVisibility"] = (!xlData[jobNbr]["DeadlineForApplications"] || xlData[jobNbr]["DeadlineForApplications"]==="") ? date_fns.parse(xlData[jobNbr]["DeadlineForApplications"], 'dd-MM-yyyy', new Date()) : cour_date.setDate(cour_date.getDate() + 14)   
//      } catch {
//       //other date format, we will change the python azure function to unify the extracted date
//     cour_req_body["startDate"] = new Date(cour_date.setDate(cour_date.getDate() + 28))
//     cour_req_body["endDate"] = new Date(cour_req_body["startDate"]).setDate(cour_date.getDate() + 365);
//     cour_req_body["lastDateVisibility"] = new Date(cour_date.setDate(cour_date.getDate() + 14) )  
   
//   }
 
//   //see the fields relevant to contact od the firm : email, phonenumber, name of the company and external publication date
//   cour_req_body["sourceJobOffers"] = {
//     typeSourceJobOffer: "external",
//     nameSourceJobOffer: xlData[jobNbr]["website"],
//     urlSourceJobOffer: xlData[jobNbr]["url"]
//   };
//   cour_req_body["externalContactsJobOffer"] = {
//     phoneNumber: xlData[jobNbr]["phoneNumbers"].split(";"),
//     emails: xlData[jobNbr]["emailsContact"].split(","),
//     nameEmployer: xlData[jobNbr]["Entreprise"],
//     ExternalpublicationDate: (!xlData[jobNbr]["DatePublication"] || xlData[jobNbr]["DatePublication"]==="") ? date_fns.parse(xlData[jobNbr]["DatePublication"], 'dd-MM-yyyy', new Date()) : cour_date.setDate(cour_date.getDate() + 28),
//   };



//   if (cour_req_body.externalContactsJobOffer.emails.length !== 0) {
//     describe('create_scrapped_job_offer_by_admin', () => {
//       it('should respond with a success message along with a single job that was added', (done) => {
//         api.post(url +'/scrappedJobs?lang=en')
//             // eslint-disable-next-line linebreak-style Object.assign(obj, {key3: "value3"});
//             //.send(cour_req_body.push({key:   "employer", value: global.jobaasScrapperCompany})).set('authorization', 'Bearer ' + global.tokenAdmin)
//             .send(Object.assign(cour_req_body, {employer: global.jobaasScrapperCompany})).set('authorization', 'Bearer ' + global.tokenAdmin)
//             .end((err, res) => {
//               // there should be no errors
//               should.not.exist(err);
//               // there should be a 200 status code
//               // (indicating that something was "created")
//               res.status.should.equal(200);
//               // the response should be JSON
//               res.type.should.equal('application/json');
//               // the JSON response body should have a
//               // key-value pair of {"status": "success"}
//               // check the message content
//               res.body.message.should.contain('new job was created with scrapping');
              
//               global.scrappedJobs.push(res.body.data.id);
//               console.log("Nombre d'offres scrappées : " + String(global.scrappedJobs));
//               done();
//             });
//       });
//     });
//   } else {
//     describe('create_scrapped_job_offer_by_admin', () => {
//       it('should respond with a failure message along with a single job that failed to be added into db', (done) => {
//         api.post(url + 'scrappedJobs?lang=en')
//             // eslint-disable-next-line linebreak-style
//             .send(cour_req_body).set('authorization', 'Bearer ' + global.tokenAdmin)
//             .end((err, res) => {
//               // there should be a 200 status code
//               // (indicating that something was "created")
//               res.status.should.equal(500);
//               // the response should be JSON
//               res.type.should.equal('application/json');
//               // the JSON response body should have a
//               // key-value pair of {"status": "success"}
//               // check the message content
//               res.body.message.should.contain('Job offer failed to be created because no email was available in the scrapped data');
//               done();
//             });
//       });
//     });
//   }
//   cour_date = new Date();
//   jobNbr+=1;
// }

