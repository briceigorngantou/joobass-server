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

let bucket;
if (config.hostname === 'localhost') {
    bucket = config.bucketNameDev
}
else if (config.hostname === 'jobaas-backend-dev.herokuapp.com') {
    bucket = config.bucketNameRel
}
else {
    bucket = config.bucketNameProd
}


global.jober_profilePic_bucketKey = "";
global.jober_identity_bucketKey = "";
global.jober2_profilePic_bucketKey = "";
global.jober2_cv_bucketKey = "";
global.company_profilePic_bucketKey = "";



//test  add a profile picture insertion in s3 bucket for Jober
describe('POST /api/v1/particular/me/fileS3 jober', () => {
    it('should respond with a success message along with a single file that was added in s3 bucket for jober', (done) => {
        api.post(baseUrl + 'fileS3' + '?fileType=profilePic&lang=en'
        ).set('authorization', 'Bearer ' + global.tokenJober).attach("file", "test/files_test/photo cv 1.png").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.jober_profilePic_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test  add a identity card insertion in s3 bucket for Jober
describe('POST /api/v1/particular/me/fileS3 jober', () => {
    it('should respond with a success message along with a single file that was added in s3 bucket for jober', (done) => {
        api.post(baseUrl + 'fileS3' + '?validity=2025-12-01&fileType=identity&lang=en'
        ).set('authorization', 'Bearer ' + global.tokenJober
        ).attach("file", "test/files_test/idcardjober1.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.jober_identity_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test  add a profile picture insertion in s3 bucket for Jober 2
describe('POST /api/v1/particular/me/fileS3 jober2', () => {
    it('should respond with a success message along with a single file that was added in s3 bucket for jober2', (done) => {
        api.post(baseUrl + 'fileS3' + '?fileType=profilePic&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2).attach("file", "test/files_test/jober2.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.jober2_profilePic_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test  add a cv insertion in s3 bucket for Jober 2
describe('POST /api/v1/particular/me/fileS3 jober2', () => {
    it('should respond with a success message along with a single file that was added in s3 bucket for jober2', (done) => {
        api.post(baseUrl + 'fileS3' + '?validity=2030-12-31&fileType=cv&lang=en')
            .set('authorization', 'Bearer ' + global.tokenJober2).attach("file", "test/files_test/cvjober2.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.jober2_cv_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test  add a profile picture insertion in s3 bucket for company
describe('POST /api/v1/company/me/fileS3 company', () => {
    it('should respond with a success message along with a single file that was added in s3 bucket for company', (done) => {
        api.post('/api/v1/company/me/fileS3?fileType=profilePic&lang=en')
            .set('authorization', 'Bearer ' + global.tokenCompany).attach("file", "test/files_test/ppcompany.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.company_profilePic_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test get a file from s3 bucket for jober
describe('GET /api/v1/particular/me/:bucketKey/streamAws jober', () => {
    it('should respond with a success message along with a single file that was retrieved from s3 bucket', (done) => {
        api.get('/api/v1/particular/me/' + global.jober_identity_bucketKey + '/streamAws?lang=en')
        .buffer()
        .parse((res, callback) => {
            res.setEncoding('binary');
            res.data = '';
            res.on('data', (chunk) => {
              res.data += chunk;
            });
            res.on('end', () => {
              callback(null, Buffer.from(res.data, 'binary'));
            });
        }).end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the type of the data into stream sh
                res.type.should.equal(mime.contentType(path.extname(global.jober_identity_bucketKey)));
                res.body.length.should.not.equal(0);
                done();
        });
    });
});

//test get a file from s3 bucket for company
describe('GET /api/v1/company/me/:bucketKey/streamAws company', () => {
    it('should respond with a success message along with a single file that was retrieved from s3 bucket for company', (done) => {
        api.get('/api/v1/company/me/'+ global.company_profilePic_bucketKey+ '/streamAws?lang=en').send({}).set('authorization', 'Bearer ' + global.tokenCompany
        )
        .buffer()
        .parse((res, callback) => {
            res.setEncoding('binary');
            res.data = '';
            res.on('data', (chunk) => {
              res.data += chunk;
            });
            res.on('end', () => {
              callback(null, Buffer.from(res.data, 'binary'));
            });
        })
        .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal(mime.contentType(path.extname(global.company_profilePic_bucketKey)));
                res.body.length.should.not.equal(0)
                done();
            });
    });
});

//test update a file from s3 bucket for jober
describe('PUT /api/v1/particular/me/fileS3/:bucketKey jober', () => {
    it('should respond with a success message along with a single file that was updated in s3 bucket for company', (done) => {
        api.put('/api/v1/particular/me/fileS3/' + global.jober_profilePic_bucketKey + '?lang=en'
        ).set('authorization', 'Bearer ' + global.tokenJober
        ).attach("file", "test/files_test/jober1.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.jober_profilePic_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});

//test update a file from s3 bucket for company
describe('PUT /api/v1/particular/me/fileS3/:bucketKey jober', () => {
    it('should respond with a success message along with a single file that was updated in s3 bucket for company', (done) => {
        api.put('/api/v1/company/me/fileS3/' + global.company_profilePic_bucketKey + '?lang=en'
        ).set('authorization', 'Bearer ' + global.tokenCompany).attach("file", "test/files_test/ppcompany.jpg").end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                res.body.data.fileUploaded.should.equal(true);
                global.company_profilePic_bucketKey = res.body.data.bucketKey;
                done();
            });
    });
});



