let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const baseUrl = '/api/v1/particular/me/';
fs = require('fs');
const config = require('../../configs/environnement/config');
let mime = require("mime");
path = require('path');
mime = require('mime-types');

global.jober_profilePic_url= "";
global.company_logo_url = "";

//test  add a profile picture insertion in mongo db for jober 2
describe('POST /api/v1/particular/me/fileManager/file', () => {
    it('should respond with a success message along with a single file that was added in mongodb bucket for jober', (done) => {
        api.post(baseUrl + 'fileManager/file' + '?fileType=profilePic&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2)
            .attach("file", "test/files_test/photo cv 1.png")
            .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            res.body.data.fileUploaded.should.equal(true);
            global.jober_profilePic_url = res.body.data.url;
            console.log(global.jober_profilePic_url);
            done();
        });
    });
});

//test  add a identity card insertion in mongodb for Jober 2
describe('POST /api/v1/particular/me/fileManager/file', () => {
    it('should respond with a success message along with a single file that was added in mongodb bucket for jober', (done) => {
        api.post(baseUrl + 'fileManager/file' + '?validity=2025-12-01&fileType=identity&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2)
            .attach("file", "test/files_test/idcardjober1.jpg")
            .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            res.body.data.fileUploaded.should.equal(true);
            done();
        });
    });
});

//test  add a profile picture insertion in mongodb for Jober 2
describe('POST /api/v1/particular/me/fileManager/file', () => {
    it('should respond with a success message along with a single file that was added in mongodb bucket for jober2', (done) => {
        api.post(baseUrl + 'fileManager/file' + '?fileType=profilePic&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2)
            .attach("file", "test/files_test/jober2.jpg")
            .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            res.body.data.fileUploaded.should.equal(true);
            done();
        });
    });
});

//test  add a cv insertion in mongodb for Jober 2
describe('POST /api/v1/particular/me/fileManager/file', () => {
    it('should respond with a success message along with a single file that was added in mongodb bucket for jober2', (done) => {
        api.post(baseUrl + 'fileManager/file' + '?validity=2030-12-31&fileType=cv&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2)
            .attach("file", "test/files_test/cvjober2.jpg")
            .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            res.body.data.fileUploaded.should.equal(true);
            done();
        });
    });
});

//get all files jober 2
describe('GET /api/v1/particular/me/metadatafiles', () => {
    it('should respond with a success message that all metafiles were got', (done) => {
        api.get(baseUrl + 'metadatafiles')
            .set('authorization', 'Bearer ' + global.tokenJober2)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                console.log(res.body.data);
                res.body.data.length.should.not.equal(0);
                done();
            });
    });
});

//test  add a  logo in mongo db for company
describe('POST /api/v1/company/me/fileManager/file', () => {
    it('should respond with a success message along with a single file that was added in mongo db for company', (done) => {
        api.post('/api/v1/company/me/fileManager/file?fileType=logo&lang=en')
            .set('authorization', 'Bearer ' + global.tokenCompany)
            .attach("file", "test/files_test/ppcompany.jpg")
            .end((err, res) => {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            res.body.data.fileUploaded.should.equal(true);
            global.company_logo_url = res.body.data.url;
            console.log(global.company_logo_url);
            done();
        });
    });
});

//get all files company
describe('get /api/v1/company/me/metadatafiles', () => {
    it('should respond with a success message that all files were got', (done) => {
        api.get('/api/v1/company/me/'+ 'metadatafiles')
            .set('authorization', 'Bearer ' + global.tokenCompany)
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                console.log(res.body.data);
                res.body.data.length.should.not.equal(0);
                done();
            });
    });
});

//TODO FIX IT
/*
//test get a file from mongo db for jober2
describe('GET /api/v1/fileManager/:idFile/stream jober', () => {
    it('should respond with a success message along with a single file that was retrieved from mongo db', (done) => {
        api.get(global.jober_profilePic_url)
            .end((err, res) => {
                console.log(global.jober_profilePic_url);
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the type of the data into stream sh
            done();
        });
    });
});

//test get a file from mongo db  for company
describe('GET /api/v1/fileManager/:idFile/stream company', () => {
    it('should respond with a success message along with a single file that was retrieved from  for company', (done) => {
        api.get(global.company_logo_url)
            .end((err, res) => {
                console.log(global.company_logo_url)
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                done();
            });
    });
});

 */


//TODO UNIT TEST UPDATE FIL

