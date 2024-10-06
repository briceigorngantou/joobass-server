const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const config = require('../configs/environnement/config');



const {
      S3,
      CreateBucketCommand,
      PutObjectCommand,
      GetObjectCommand,
      ListObjectsCommand,
      DeleteObjectCommand,
      DeleteBucketCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl  } = require("@aws-sdk/s3-request-presigner");
const {fromIni} = require("@aws-sdk/credential-provider-ini");
const fetch = require("node-fetch");


let bucket;
let s3Client;

bucket = config.bucketName;
if (config.hostname === 'localhost') {

    s3Client = new S3({
        credentials: fromIni({profile: 'default'}),
        region: "af-south-1"
    });
}
else  {
    s3Client = new S3({ region: config.AWS_REGION });
}


const createBucket = async function () {
    const bucketParams = { Bucket: bucket };
    try {
        const data = await s3Client.send(new CreateBucketCommand(bucketParams));
        console.log("Success", data.Location);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
};

const storeFile = async function () {
    const date = Date.now();
    const nameFile = 'file_' + date;
    const storage = GridFsStorage({
        url: config.databaseUri,
        options: {useUnifiedTopology: true},
        file: (req, file) => {
            console.log(file);
            return {
                filename: nameFile,
            };
        },
    });

    // Multer configuration for single file uploads
    const upload = multer({
        storage: storage,
    }).single('file');

    return {'upload': upload, 'nameFile': nameFile};
};

const storeFileAws = async function (meta, fileStream) {
    console.log("start of uploading " + meta.name + " in s3 bucket");
    const uploadParams = {
        Bucket: bucket,
        // Specify the name of the new object. For example, 'index.html'.
        // To create a directory for the object, use '/'. For example, 'myApp/package.json'.
        Key: meta.name,
        // Content of the new object.
        Body: fileStream
    };
    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(
            "Successfully uploaded object: " + uploadParams.Bucket + "/" + uploadParams.Key
        );
        return {"data": {"bucketName": uploadParams.Bucket, "bucketKey": uploadParams.Key},
                            "message": "upload successful"}
    } catch (err) {
        console.log("Error", err);
        return {"data": null, "message": err}
    }
};

const getFile = async function (param, criteria) {
    const conn = await mongoose.connection;
    const gfs = Grid(conn.db, mongoose.mongo);
    let result = null;
    if (param === 'name') {
        console.log(' NAME FOR FILE STREAMER');
        const testdb = await gfs.files.find({}).toArray();
        console.log('I AM OUT OF ALL DB FILES TEST');
        result = await gfs.files.find({filename: criteria}).toArray();
    }
    return result;
};

//get the key, the bucket and the content (stream) of the file
const getFileAws = async function (key) {
    console.log("call of service to get " + key + " object from s3 bucket " + bucket)
    // Create the parameters for the bucket
    const objectParams = { Bucket: bucket, Key:  key};
    try {
        const data = await s3Client.send(new GetObjectCommand (objectParams));
        console.log("Object " + key + " retrived from s3 bucket " + bucket);

        const assembleStream = async (stream, options={}) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => {
                    const result = Buffer.concat(chunks);
                    resolve(options.string ? result.toString('utf-8') : result);
                });
            });
        };
        // get the content of the file into a stream format
        const bodyContents = await assembleStream(data.Body);
        console.log("End of call of get file aws service : Content of object " + key + " correctly assembled into a stream");
        return {"data": {"bucketName": objectParams.Bucket, "bucketKey": objectParams.Key, "stream": bodyContents}, "message": "Successful retrieving of the file"};
    } catch (err) {
        console.log("Error", err);
    }
};

const getStream = async function (id) {
    const conn = await mongoose.connection;
    const gfs = Grid(conn.db, mongoose.mongo);
    console.log('get stream idfile : ' + id);
    const files = await getFileById(id);
    let readstream;
    if (files) {
        readstream = gfs.createReadStream({
            _id: files._id,
        });
        return {'stream': readstream, 'type': files.contentType};
    } else {
        return null;
    }
};

const getFileById = async (id) => {
    console.log('get file by id : ' + id);
    const conn = await mongoose.connection;
    const gfs = Grid(conn.db, mongoose.mongo);
    const objectId = mongoose.Types.ObjectId(id);
    const result = await gfs.files.findOne({_id: objectId});
    console.log("I found a file");
    return result;
};

const getAllFiles = async () => {
    let result;
    const conn = await mongoose.connection;
    const gfs = Grid(conn.db, mongoose.mongo);
    result = await gfs.files.find({}).toArray();
    return result;
};

const getAllFilesAws = async function () {
    // Create the parameters for the bucket
    const bucketParams = { Bucket: bucket };
    try {
        const data = await s3Client.send(new ListObjectsCommand(bucketParams));
        console.log("Success", data);
        return {"listObjects": data.Contents}
    } catch (err) {
        console.log("Error", err);
    }
};

const deleteFile = async function (key) {
    // Create the parameters for the bucket
    console.log("call of delete service for aws file by bucketKey " + key);
    const objectParams = { Bucket: bucket, Key:  key};
    try {
        const data = await s3Client.send(new DeleteObjectCommand (objectParams));
        console.log("Success", data);
        return data
    } catch (err) {
        console.log("Error", err);
    }
};

const deleteBucket = async function () {
    try {
        const data = await s3Client.send(new DeleteBucketCommand(bucketParams));
        return data; // For unit tests.
        console.log("Success - bucket deleted");
    } catch (err) {
        console.log("Error", err);
    }
};

module.exports = {
    storeFile: storeFile,
    storeFileAws: storeFileAws,
    getFile: getFile,
    getFileAws: getFileAws,
    getStream: getStream,
    getAllFiles: getAllFiles,
    getAllFilesAws: getAllFilesAws,
    getFileById: getFileById,
    deleteFileAws: deleteFile,
    createBucket: createBucket,
    deleteBucket: deleteBucket
};
