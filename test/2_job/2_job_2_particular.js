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
const urlRegistration = '/api/v1/particular';
global.jobParticularId = '';
global.jobParticularId3 = '';
global.jobParticularId4 = '';
global.scrappedJobOffersId = []


// token information

// test job insertion

describe('create_first_regular_job_with_one_place_by_jobprovider_for_himself', () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        .send({
          'town': 'Yaounde',
          'street': 'Odza ',
          'referenceStreet': 'Africa bank',
          'title': 'Recherche d\'un répétiteur',
          'description': 'i\'m looking for a teacher for a party ',
          'state': 'created',
          'employer': global.idJobProvider,
          'nbplaces': 1,
            'price': 100000,
          'tags': ['Education', 'Web_service'],
          'startDate': global.startDate,
            'lastDateVisibility': global.lastDateVisibility,
            'packLevelId': global.packPaidId,
            'insuranceChecked': true,
          'endDate': global.endDate,
          'frequency': {
            'isRegular': true,
            'value_frequency': [
              {
                'day': 'monday',
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              }],
          },
          'employerPayment': 50000,
          'cv_required': false,
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
          // check the message content
          res.body.message.should.contain('new job was created');

          global.jobParticularId2 = res.body.data.id;
          console.log('global id : ' + global.jobParticularId2);
          done();
        });
  });
});

describe('create_second_job_regular_with_three_places_by_jobprovider_for_himself', () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        .send({
          'registrationDate': '2020-03-13T06:26:53.205Z',
          'town': 'Cap town',
          'street': 'Ludovic ',
          'referenceStreet': 'Africa bank',
          'title': 'Garde du corps',
            'price': 50000,
          'description': 'i\'m looking for a bodyguard for a party ',
          'state': 'created',
          'employer': global.idJobProvider,
            'packLevelId': global.packPersonalizedId,
            'insuranceChecked': true,
          'nbplaces': 3,
          'startDate': global.startDate,
          'endDate': global.endDate,
          'frequency': {
            'isRegular': true,
            'value_frequency': [
              {
                'day': 'monday',
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': 'thursday',
                'timeSlots': [
                  {
                    'startHour': '15:00',
                    'endHour': '18:00',
                  },
                ],
              },
            ],
          },
          'employerPayment': 10000,
          'cv_required': false,
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
          // check the message content
          res.body.message.should.contain('new job was created');
          global.jobParticularId = res.body.data.id;
          console.log('global id : ' + global.jobParticularId);
          done();
        });
  });
});

// eslint-disable-next-line max-len
describe('create_third_job_with_regular_by_admin_for_the_first_employer' + url, () => {
  it('should respond with a success message along with a single job that was added', (done) => {
    api.post(url + '?lang=en')
        .send({
          'registrationDate': '2020-03-13T06:26:53.205Z',
          'town': 'Cap town 2',
          'street': 'Ludovic 2 ',
          'referenceStreet': 'Africa bank 2',
          'title': 'Gardien pour une fête',
            'price': 50000,
            'packLevelId': global.packPaidId,
            'insuranceChecked': false,
          'description': 'i\'m looking for a bodyguard for a party 2 ',
          'employer': global.idJobProvider,
          'nbplaces': 3,
          'startDate': global.startDate,
          'endDate': global.endDate,
          'frequency': {
            'isRegular': true,
            'value_frequency': [
              {
                'day': 'monday',
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': 'thursday',
                'timeSlots': [
                  {
                    'startHour': '15:00',
                    'endHour': '18:00',
                  },
                ],
              },
            ],
          },
          'isPriceDefined': false,
          'employerPayment': 10000,
          'cv_required': false,
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
          // check the message content
          res.body.message.should.contain('new job was created');
          global.jobParticularId3 = res.body.data.id;
          done();
        });
  });
});

describe('create_fourth_punctual_job_by_jobprovider_for_himself' + url, () => {
  it('should respond with success creation of job', (done) => {
    api.post(url + '?lang=en')
        .send({
          'town': 'Lagos',
          'street': 'test ',
          'referenceStreet': 'UBA',
          'title': 'Agent d\'accueil',
          'description': 'Nous recherchons un agent pour accueillir et diriger les clients ',
          'state': 'created',
            'price': 40000,
          'employer': global.idJobProvider,
          'nbplaces': 3,
          'startDate': global.startDate,
            'packLevelId': global.packFreeId,
          'endDate': global.endDate,
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
                    'startHour': '15:00',
                    'endHour': '18:00',
                  },
                ],
              },
            ],
          },
          'employerPayment': 10000,
          'cv_required': false,
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
          // check the message content
          global.jobParticularId4 = res.body.data.id;
          console.log('global id 4 : ' + global.jobParticularId4);
          done();
        });
  });
});


describe('create_punctual_job_with_invalid_date_in_list_of_dates' + url, () => {
  it('should respond with a error message saying one of the dates is not valid', (done) => {
    api.post(url + '?lang=en')
        .send({
          'registrationDate': '2020-03-13T06:26:53.205Z',
          'town': 'Lagos',
          'street': 'test ',
          'referenceStreet': 'UBA',
          'title': 'Agent d\'accueil',
            'packLevelId': global.packFreeId,
          'description': 'Nous recherchons un agent pour accueillir et diriger les clients ',
          'state': 'created',
          'employer': global.idJobProvider,
          'nbplaces': 3,
            'price': 30000,
          'startDate': global.startDate,
          'endDate': global.endDate,
          'frequency': {
            'isRegular': false,
            'listOfDates': [
              {
                'day': '2020-03-15',
                'timeSlots': [
                  {
                    'startHour': '08:00',
                    'endHour': '14:00',
                  },
                ],
              },
              {
                'day': '2020-04-16',
                'timeSlots': [
                  {
                    'startHour': '15:00',
                    'endHour': '18:00',
                  },
                ],
              },
            ],
          },
          'employerPayment': 10000,
          'cv_required': false,
        }).set('authorization', 'Bearer ' + global.token)
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
          console.log(res.body.message);
          res.body.message.should.contain('All dates of work need to be between start date and end date');
          done();
        });
  });
});


// update a job state to validated , here we first save the id of the job from the previous get request

describe('update_the_state_of_the_second_job_by_controller_to_set_valid' + url2 + '/job/:idJob/validate', () => {
  console.log('global id update :' + global.jobParticularId);
  it('should respond with a success message along with a single job that was updated id ' + global.jobParticularId, (done) => {
    api.put(url2 + '/job/' + global.jobParticularId2 + '/validate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenController)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          res.body.message.should.contain('has been  validated and');
          done();
        });
  });
});

describe('update_the_state_of_the_third_job_by_controller_to_set_valid', () => {
  console.log('global id update :' + global.jobParticularId3);
  it('should respond with a success message along with a single job that was updated id ' + global.jobParticularId3, (done) => {
    api.put(url2 + '/job/' + global.jobParticularId3 + '/validate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenController)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          res.body.message.should.contain('has been  validated and');
          done();
        });
  });
});

describe('update_the_state_of_the_first_job_by_controller_to_set_valid', () => {
  console.log('global id update :' + global.jobParticularId);
  it('should respond with a success message along with a single job that was updated id ' + global.jobParticularId, (done) => {
    api.put(url2 + '/job/' + global.jobParticularId + '/validate?lang=en')
        .set('authorization', 'Bearer ' + global.tokenController)
        .send({})
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          // (indicating that something was "updated")
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the return object should have the same id that the one the use to get it
          res.body.message.should.contain('has been  validated and');
          done();
        });
  });
});


// update a job  ,controller validate the job
describe('update_some_infos_of_first_job_by_jobprovider_himself_set_nbplaces_one', () => {
  console.log('global id update :' + global.jobParticularId);
  it('should respond with a success message along with a single job that was updated', (done) => {
    api.put(url + '/' + global.jobParticularId + '?lang=en')
        .set('authorization', 'Bearer ' +global.token)
        .send({
          'town': 'Douala',
          'title': 'writer',
          'nbplaces': 1,
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
            res.body.data.title.should.equal('Writer');
          res.body.data.nbplaces.should.equal(1);

          done();
        });
  });
});
// get the jobs list shouldn't be empty cause we just added one job previously
describe('get_list_of_jobs_by_jobprovider', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url + '?lang=en').set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
        // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // the numbers of jobs objects should be not null
          res.body.data.length.should.not.equal(0);

          done();
        });
  });
});

// get the jobs using filter "town": "Douala"
const townTest = 'douala';
describe('filter_job_by_town', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url + '?lang=en&level=1&town=' + townTest).set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // check the town value
          res.body.data.jobs[0].town.should.eql(townTest);
          // the numbers of jobs objects should be not null
          res.body.data.jobs.length.should.not.equal(0);
          done();
        });
  });
});


// get the jobs using regex filter "town": "Cap town"
const keyword='body';
const typeFilter = 'raw';
describe('filter_job_by_keyword', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url + '?lang=en&typeFilter=' + typeFilter + '&keyword=' + keyword).set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // the numbers of jobs objects should be not null
          res.body.data.jobs.length.should.not.equal(0);
          done();
        });
  });
});


// get a single job
describe('get_job_by_jobprovider', () => {
  it('should respond with a success message along with a single get on a job that was added', (done) => {
    api.get(url + '/' + global.jobParticularId + '?lang=en').set('authorization', 'Bearer ' + global.token)
        .set('authorization', 'Bearer '+global.token)
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

// get a single job with false id

describe('get_job_with_fake_id_and_error_during_this_action', () => {
  const fakeId = '5ds';
  it('should respond with a error message along with a single job that wasn t added', (done) => {
    api.get(url + '/' + fakeId + '?lang=en').set('authorization', 'Bearer ' + global.token)
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

// get specific number of jobs
describe('get_number_of_jobs_by_jobprovider', () => {
  it('should respond with a success message along with a get on a specific number of  jobs that were added using limit parameter', (done) => {
    api.get(url + '?lang=en&limit=1').set('authorization', 'Bearer ' + global.token)
        .set('authorization', 'Bearer ' + global.token)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // global.joBid = res.body.data[0].id ;
          // the numbers of jobs objects should be not null
          res.body.data.length.should.not.equal(0);
          done();
        });
  });
});

describe('get_jobs_with_jobprovider', () => {
  it('should respond with a success message along with a get on a specific number of  jobs that were added using limit parameter', (done) => {
    api.get(url3 + '?lang=en&limit=1')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // global.joBid = res.body.data[0].id ;
          // the numbers of jobs objects should be not null
          res.body.data.length.should.not.equal(0);
          done();
        });
  });
});

// get the jobs using filter "town": "Cap town"
describe('filter_job_with_town', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url3 + '?town=' + townTest + '&lang=en')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // check the message content
          // check the town value
          res.body.data.jobs[0].infoJob.town.should.eql(townTest);
          // the numbers of jobs objects should be not null
          res.body.data.jobs.length.should.not.equal(0);
          done();
        });
  });
});


// get the jobs using regex filter "town": "Cap town"
describe('filtrçwith_keyword', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url3 + '?lang=en&typeFilter=' + typeFilter + '&keyword=' + keyword)
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // check the town value
          // the numbers of jobs objects should be not null
          res.body.data.jobs.length.should.not.equal(0);

          done();
        });
  });
});

// get the jobs list shouldn't be empty cause we just added one job previously
describe('get_list_of_jobs', () => {
  it('should respond with a success message along with a get on all the  jobs that were added', (done) => {
    api.get(url3 + '?lang=en')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // the numbers of jobs objects should be not null
          res.body.data.length.should.not.equal(0);
          done();
        });
  });
});

// when an user register with email associated with an external job pubished on the plateform all the jobs associated with his email should be updated with him as employer
describe('create_particular_account from user associated with external job', () => {
  it(' when an user register with email associated with an external job pubished on the plateform all the jobs associated with his email should be updated with him as employe', (done) => {
    api.post(urlRegistration + '?lang=en')
    .send(
        {
            "name": global.nameJobProvider,
            "surname": global.surnameJobProvider,
            "description": "Je suis " + global.nameJobProvider + " " + global.surnameJobProvider + " contacte  moi à  " + global.jobProviderEmail,
            "MoneyAccount": [337861770319],
            "phoneNumber": {"value": 699820042},
            "email": {"value": "successconsults2035-testJobaas@gmail-testJobaas.com"},
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
            "birthday": "1999-03-15",
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
        const expectedNbJobAffected = 1;
        console.log(res.body.data);
        res.body.data.jobUpdatedDetail.nbJobAffected.should.equal(expectedNbJobAffected);
        done();
    });
  });
});

