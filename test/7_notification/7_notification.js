const chai = require('chai');
const server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const serviceName = 'notification';
const baseUrl = '/api/v1/';
const url = baseUrl + serviceName;
const url2 = '/api/v1/particular/me/notification';
global.idNotification = '';


// token information

// test notification insertion

describe('POST /api/v1/notification', () => {
    it('should respond with a success message along with a single notification that was added', (done) => {
        api.post(url + '?lang=en')
            .send({
                'date_event': '2020-03-13T06:26:53.205Z',
                'type_event': 'application',
                'text': "Vous avez une nouvelle candidature pour votre job",
                'readState': false,
                'receiver': global.idJobProvider,
                'notifPic': "https://www.codeur.com/blog/wp-content/uploads/2017/10/reussir-notification-push-700x423.jpg",
                'notifUrl': baseUrl + 'string'
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
                res.body.message.should.eql('new notification was created');

                global.idNotification = res.body.data.id;
                console.log('global id : ' + global.idNotification);
                done();
            });
    });
});



// all notifications
describe('GET /api/v1/notification', () => {
    it('should respond with a success message along with a single notification that was added', (done) => {
        api.get(url2 + '?lang=en')
            .set('authorization', 'Bearer ' + global.token)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.notifications.length.should.not.equal(0);
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                // check the message content

                done();
            });
    });
});



