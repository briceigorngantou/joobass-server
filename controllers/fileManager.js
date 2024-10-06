const fileService = require('../services/fileStreamer');
const metafileService = require('../services/metafile');
const Grid = require('gridfs-stream');
const error_processing = require('../common/utils/error_processing');
const particularService = require('../services/particular');
const applicationService = require('../services/application');
const companyService = require('../services/company');
const blogArticleService = require('../services/blogArticle');
const smsService = require('../services/sms');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const _ = require('lodash');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const notificationService = require('../services/notification');
const ENTREPRISE_USER = config.permissionLevels.ENTREPRISE_USER;
const emailService = require('../services/email_sender');
const no_mail = config.no_mail;
const it_mails = config.it_mails;
const mime = require('mime-types');
const { Readable, Transform } = require('stream');
const fs = require("fs");
const file_tags = require('../common/utils/enum').file_tags;
const path = require('path');
const Busboy = require('busboy');
const {communicationRights} = require("../common/utils/enum");
const {jobFilesRequired, stateJob, tags} = require("../common/utils/enum");

let bucket = config.bucketName;


const createBucket = async(req, res) => {
    let result;
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        result = await fileService.createBucket();
        if (result) {
            message = (lang==='en') ? "New bucket S3 was created for the current env": "Un nouveau compartiment S3 a été crée"
            return res.status(200).json({"data": result, "message": message});
        }
        else{
            message = (lang==='en') ? "New bucket S3 was created for the current env": "Un nouveau compartiment S3 a été crée"
            return res.status(500).json({"message": message})
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
    });
    }
};


const getAllMetaFiles = async (req, res) => {
    let files;
    let page = 0;
    const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 3;
    
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        // for /me/metafiles
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            console.log(req.jwt.userId);
            req.query.owner = req.jwt.userId;
        }
        const pagination = req.query.pagination && req.query.pagination === "false" ?  false: true;
        console.log('call of fileManager controller: Get All metadafiles');
        files = await metafileService.getAllMetafiles(limit, page, req.query, pagination);
        console.log('there are files');
        return res.status(200).json({
            'data': files
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getAllFilesAws = async(req, res) => {
    let files;
    try {
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        files = await fileService.getAllFiles(req.jwt.userId);
        console.log('there are files');
        return res.status(200).json({
            'data': files
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getFileStreamedAws = async(req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let file = await fileService.getFileAws(req.params.bucketKey);
        console.log(Buffer.isBuffer(file.data.stream));
        let message;
        if (Buffer.isBuffer(file.data.stream))
        {
            const readable = new Readable()
            readable._read = () => {}; // _read is required but you can noop it
            readable.push(file.data.stream);
            readable.push(null);
            message = lang === 'en' ? "The name and stream of file identified with s3 bucket " + file.data.bucketKey + " have been successfully retrieved from " + file.data.bucketName : "Les nom et contenus du fichier avec la clé " + file.data.bucketKey + " ont été correctement téléchargés depuis le bucket " + file.data.bucketName ;
            console.log(message);
            res.set('Content-Type', mime.contentType(path.extname(file.data.bucketKey)));
            return readable.pipe(res);
        } else {
        message = lang === 'en' ? "No file identified by bucketKey " + req.params.bucketKey + " has been found in the s3 bucket " + bucket : "Aucun fichier identifié par le bucketKey" + req.params.bucketKey + "n'a été trouvé dans le bucket " + bucket;
            return res.status(404).json({
                'message': message
            })
        }

    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateMetafile = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const metafile = await metafileService.updateMetafile(req.params.idMeta, req.body);
        let message;
        if (!metafile) {
            message = lang === 'fr' ? "Aucun meta fichier n'a été trouvé via l'id"
                : "metafile not found  id";
            console.log('metafile not found  id ' + req.params.idMeta);
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === 'fr' ? "Mise à jour du meta fichier identifié par l'id"
            : "the metafile was updated by id";
        console.log('the metafile was updated by id : ' +  req.params.idMeta);
        return res.status(200).json({
            'message': message
        });
    } catch (e) {
        console.log(e.message);
        const environment = config.env;
        if (Number(no_mail === 0) && environment !== './dev') {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${environment}] Erreur Backend mise à jour des méta données`,
                "html": `${e.message}`
            });
        }
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createNameFile = (name, fileType) => {
    let fileName = name.trim().split(' ');
    const day = new Date(Date.now());
    const second = day.getTime();
    fileName = fileName[0] + '_' + fileType + '_' + second;
    console.log(fileName);
    return fileName
};

//TODO NOT READY TO BE IMPLEMENTED; THINK ABOUT UPDATE IT WITH LOGO ARTICLE CASE
const createFileAws = async (req, res) => {
    let name;
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    let ownerId;

    if (req.jwt) {
        typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise" : "particular";
        name = req.query.name ? req.query.name :  typeOwner === "entreprise" ?
        req.jwt.nameCompany : req.jwt.name;
        ownerId = req.params.id ? req.params.id : req.jwt.userId;
     }

    else {
        const employee = await  particularService.getAllParticulars(1,0, {"email.value":req.query["email"]}) ;
        typeOwner =  "particular";
        name =  employee.particulars[0].name;  
        ownerId = employee.particulars[0]._id ;
    }
     
    name = createNameFile(name, req.query.fileType);

    console.log('final name process create file : ' + name);

    console.log("file type  : " + req.query.fileType);

    if (!req.query.validity && req.query.fileType !== 'profilePic') {
        message = lang === 'fr' ? 'Vous devez ajouter la date de validité de votre fichier'
            : 'You need to add the validity date of the file please';
        return res.status(400).json({
            'message': message
        });
    }
    const meta = {
        'owner': ownerId,
        'name': name,
        'fileType': req.query.fileType,
        'fileId': null,
        'validity': req.query.validity,
        'bucketName': bucket,
        'bucketKey': null
    };
    const busboy = new Busboy({headers: req.headers});
    let metafile;
    let data;
    console.log('create file process');
    try {
        const file = req.files.file;
        //TODO find why the file is renamed blob
        extension = "."+file.mimetype.split("/")[1] //path.extname(file.name);
        name = name + extension;
        meta.name = meta.name + extension;
        nameFile = meta.name;
        busboy.on('finish', async function() {
            console.log('Loading of stream file in req finished');
            data = await fileService.storeFileAws(meta, file.data);
            console.log('uploader process for s3 bucket called');
            metafile = await processFileAws(nameFile, meta);
            console.log(data);
            console.log('after uploading process for s3 bucket');
            let url;
            if (metafile) {
                message = lang === 'fr' ? "Nouveau fichier créé" : "new file was created";
                console.log("new file was created");
                await updateUserUrlFile(meta,typeOwner);  
                
                if (Number(no_mail === 0)) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm, info@jobaas.cm',
                        "subject": `Demande de validation du fichier  avec bucketName ${metafile.bucketName} et bucketKey ${metafile.bucketKey}`,
                        "html": `le document avec la clé ${metafile.bucketKey} dans le bucket ${metafile.bucketName} est en attente de validation`
                    });
                }
                return res.status(200).json({
                    'message': message,
                    'data': {'fileUploaded': true, 'bucketName': metafile.bucketName, 'bucketKey': metafile.bucketKey},
                });
            } else {
                if (Number(no_mail === 0)) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                        "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                        "html": `Erreur consulter les logs`
                    });
                }
                console.log('an error occured in uploading file');
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                return res.status(500).json({
                    'message': error_processing.process(err)
                });
            }
        });
        req.pipe(busboy);
    } catch (e) {
        if (Number(no_mail === 0)) {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                "html": `Erreur consulter les logs`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createGenericFileAws = async (file, name, typeOwner, ownerId, validity, fileType, permissionLevel, headers, req) => {

    let message;
    const lang = 'en';
    name = createNameFile(name, fileType);
    let nameFile;
    console.log('final name process create file : ' + name);

    console.log("file type  : " + fileType);

    const meta = {
        'owner': ownerId,
        'name': name,
        'fileType': fileType,
        'fileId': null,
        'validity': validity,
        'bucketName': bucket,
        'bucketKey': name
    };
    const busboy = new Busboy({headers: headers});
    let metafile;
    let data;
    console.log('create file process');
    try {

        extension = path.extname(file.name);
        meta.name = meta.name + extension;
        nameFile = meta.name;
        busboy.on('finish', async function() {
            console.log('Loading of stream file in req finished');
            data = await fileService.storeFileAws(meta, file.data);
            console.log('uploader process for s3 bucket called');
            metafile = await processFileAws(nameFile, meta);
            console.log(data);
            console.log('after uploading process for s3 bucket');
            let url;
            if (metafile) {
                await updateUserUrlFile(meta,typeOwner);             
            } else {

                console.log('an error occured in uploading file');
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                return null;
            }
        });
        req.pipe(busboy);     
        return meta;
    } catch (e) {
        if (Number(no_mail === 0)) {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                "html": `Erreur consulter les logs`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return -2;
    }
};

const formatUrl = async (meta) => {
    const url = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port+"/api/v1/fileManager/"+meta.name+"/streamAws" : 'https://' + config.hostname+"/api/v1/fileManager/"+meta.name+"/streamAws";
    return url;
}

const updateUserUrlFile = async (meta, typeOwner) => {

    const url = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port+"/api/v1/fileManager/"+meta.bucketKey+"/streamAws" : 'https://' + config.hostname+"/api/v1/fileManager/"+meta.bucketKey+"/streamAws";
    typeOwner = typeOwner ? typeOwner: meta.typeOwner 
    const fileType = meta.fileType;
    const ownerId = meta.owner;
    if (fileType === 'profilePic') {
        if (typeOwner === "entreprise") {
            await companyService.updateCompany(ownerId, {'profilePic.url': url})
        } else {
            await particularService.updateParticular(ownerId, {'profilePic.url': url});
        }
    } else if (fileType === 'logo') {
        if (typeOwner === "entreprise") {
            await companyService.updateCompany(ownerId, {'imageUrl.url': url})
        } else {
            return -1
        }
    } else if (fileType === 'logoBlogArticle') {
           // UNDECLARED  VARIABLE await blogArticleService.updateBlogArticle(req.params.idBlogArticle, {'headImageUrl': url}, ownerId)
            
           // await metafileService.updateMetafile(metafile.id, {"state": "valid"});
    } else if (fileType === 'identity') {
        if (typeOwner === "entreprise") {
            await companyService.updateCompany(ownerId, {'identityCard.url': url});
        } else {
            await particularService.updateParticular(ownerId, {'identityCard.url': url});
        }
    } else if (fileType === 'driver_permit') {
        await particularService.updateParticular(ownerId, {'driver_permit.url': url});
    } else if (fileType === 'schoolLevel') {
        await particularService.updateParticular(ownerId, {'schoolLevel.url': url});
    } else if (fileType === 'cv') {
        await particularService.updateParticular(ownerId, {'cv.url': url});

    }
    return url ;
}
const createMultipleFileAws = async (req, res, next) => {
    let name;
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    let response = req.query.response ? true : false;
    let ownerId ;
    if (Object.keys(req.files).length === 0){
        return next();
    }
    if (req.jwt) {
        typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise" : "particular";
        name = req.query.name ? req.query.name :  typeOwner === "entreprise" ?
        req.jwt.nameCompany : req.jwt.name;
        ownerId = req.params.id ? req.params.id : req.jwt.userId;
     } else {
        typeOwner = "particular";
        const employee = await  particularService.getAllParticulars(1,0, {"email.value":req.body['email.value']}) ;
        name =  employee.particulars[0].name;  
        ownerId = employee.particulars[0]._id ;
    } 

    try {   
            let metafiles = [];
            let metafilesUrl = {};
            let currentMetaFile;
            let currentFileType;
            filesColums = {"cv":"cv.url","identityCard":"identity_card.url", "driverPermit":"driver_permit.url", "schoolLevel":"school_level.url"};
            filesTypeColums = {"identityCard":"identity", "driverPermit":"driver_permit", }
            for (const [fileType, data] of Object.entries(req.files)) {
                    // Due to convention name we can 
                    currentFileType = filesTypeColums.hasOwnProperty(fileType) ? filesTypeColums[fileType] : fileType 
                    currentMetaFile =  await createGenericFileAws (req.files[fileType], name ,typeOwner, ownerId, req.query.validity, currentFileType , req.jwt? req.jwt.permissionLevel : [], req.headers, req);
                    metafiles.push(currentMetaFile);
                    req.body[filesColums[fileType]] = await formatUrl(currentMetaFile);
            }            

            if (metafiles.length) {
                message = lang === 'fr' ? "Nouveau fichier créé" : "new file was created";
                console.log("new file was created");

                if (Number(no_mail === 0)) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm, info@jobaas.cm',
                        "subject": `Demande de validation du fichier   ${metafile.name}`,
                        "html": `le document  suivant url à completer ${"URL"} est en attente de validation`
                    });
                }
                if(!response){
                    return next();
                } 
               
                return res.status(200).json({
                    'message': message,
                    'data': {metafilesUrl:metafilesUrl}
                });
            } else {
                if (Number(no_mail === 0)) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                        "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                        "html": `Erreur consulter les logs`
                    });
                }
                console.log('an error occured in uploading file');
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                return res.status(500).json({
                    'message': error_processing.process(err)
                });
            }
    } catch (e) {
        if (Number(no_mail === 0)) {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                "html": `Erreur consulter les logs`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createFile = async (req, res) => {
    let name;
    let message;
    let ownerId ;
    let typeOwner ;
    const lang = req.query.lang ? req.query.lang : 'en';
    if (req.jwt) {
        typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise" : "particular";
        name = req.query.name ? req.query.name :  typeOwner === "entreprise" ?
        req.jwt.nameCompany : req.jwt.name;
        ownerId = req.params.id ? req.params.id : req.jwt.userId;
     } else {
        const employee = await  particularService.getAllParticulars(1,0, {"email.value":req.query["email"]}) ;
        typeOwner =  "particular";
        name =  employee.particulars[0].name;  
        ownerId = employee.particulars[0]._id ;
    }    
    name = createNameFile(name, req.query.fileType);
    console.log('final name process create file : ' + name);
    console.log("file type  : " + req.query.fileType);
    if (!req.query.validity) {
        if(req.query.fileType !== "logo" && req.query.fileType !== "profilePic" && req.query.fileType !== "logoBlogArticle"){
            message = lang === 'fr' ? 'Vous devez ajouter la date de validité de votre fichier'
                : 'You need to add the validity date of the file please';
            return res.status(400).json({
                'message': message
            });
        }
    }
    const meta =  {
        'owner': ownerId,
        'name': name,
        'typeOwner': typeOwner,
        'fileType': req.query.fileType,
        'fileId': null,
        'validity': req.query.validity
    };
    let metafile;
    try {
        const uploader = await fileService.storeFile();
        const nameFile = uploader.nameFile;
        console.log('nameFile : ' + nameFile);
        await uploader.upload(req, res, async (err) => {
            console.log("in uploader tool");
            if (err) {
                console.log(err.message);
                const error = new error_processing.BusinessError(" ", "",
                    500, "undefined", lang);
                return res.status(500).json({
                    'message': error_processing.process(error)
                });
            }
            console.log('uploader process call');
            metafile = await processFile(nameFile, meta);
            console.log('after uploading process');
            let url;
            let mail;
            if (metafile) {
                message = lang === 'fr' ? "Nouveau fichier créé" : "new file was created";
                console.log("new file was created");
                let urlServer = config.hostname === 'localhost' ?
                    'http://' + config.hostname + ':' + config.port + '/api/v1/fileManager/' + metafile.fileId + '/stream'
                    : 'https://' + config.hostname + '/api/v1/fileManager/' + metafile.fileId + '/stream';
                // we add www for prod env
                url = config.env === './production' ? 'https://www.' + config.hostname + '/api/v1/fileManager/' + metafile.fileId + '/stream'
                    : urlServer;
                if (req.query.fileType === 'profilePic') {
                    if (typeOwner === "entreprise") {
                        await companyService.updateCompany(ownerId, {'profilePic.url': url})
                    } else {
                        await particularService.updateParticular(ownerId, {'profilePic.url': url});
                    }
                } else if (req.query.fileType === 'logo') {
                    if (typeOwner === "entreprise") {
                        await companyService.updateCompany(ownerId, {'imageUrl': url})
                    } else {
                        return res.status(400).json({
                            'message': 'Logo Type Not allowed for particular user'
                        });
                    }
                } else if (req.query.fileType === 'logoBlogArticle') {
                        await blogArticleService.updateBlogArticle(req.params.idBlogArticle, {'headImageUrl': url}, ownerId)
                        await metafileService.updateMetafile(metafile.id, {"state": "valid"});
                } else if (req.query.fileType === 'identity') {
                    if (typeOwner === "entreprise") {
                        await companyService.updateCompany(ownerId, {'identityCard.url': url});
                    } else {
                        await particularService.updateParticular(ownerId, {'identityCard.url': url});
                    }processFileAws
                } else if (req.query.fileType === 'driver_permit') {
                    await particularService.updateParticular(ownerId, {'driver_permit.url': url});
                } else if (req.query.fileType === 'schoolLevel') {
                    await particularService.updateParticular(ownerId, {'schoolLevel.url': url});
                } else if (req.query.fileType === 'cv') {
                    await particularService.updateParticular(ownerId, {'cv.url': url});
                }
                const environment = config.env;
                if (Number(no_mail) === 0 && environment !== './dev') {
                    const ValidationMessage = `le document avec l'id ${metafile.fileId} est en attente de validation ${url}`;
                    let mailTemplate = fs.readFileSync(path.join(__dirname, "../common/mails/file_validation_fr.html"), "utf8");
                    const footer = fs.readFileSync(path.join(__dirname, '/../common/mails/footer.html'), 'utf8');
                    mail = mailTemplate;
                    mail = mail.replace('#footer', footer);
                    mail = mail.replace("#lien", url);
                    mail = mail.replace("#message", ValidationMessage);
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": it_mails,
                        "subject": `[${environment}] Demande de validation du fichier  ${metafile.fileId}`,
                        "html": mail
                    });
                }
                return res.status(200).json({
                    'message': message,
                    'data': {'fileUploaded': true, 'url': url},
                });
            } else {
                const environment = config.env;
                if (Number(no_mail === 0) && environment !== './dev') {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                        "subject": `[${environment}] Erreur Backend dans l'ajout des fichiers`,
                        "html": `Erreur consulter les logs`
                    });
                }
                console.log('an error occurred in uploading file');
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                return res.status(500).json({
                    'message': error_processing.process(err)
                });
            }
        });
        console.log('upload in mongo db completed');
    } catch (e) {
        const environment = config.env;
        if (Number(no_mail === 0) && environment !== './dev') {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${environment}] Erreur Backend dans l'ajout des fichiers`,
                "html": `${e.message}`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const validateFile = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    const typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise" : "particular";
    let idMeta = req.params.idMeta;
    let message, jober, text, joberNotification;
    try {
        const metafile = await metafileService.updateMetafile(idMeta, {"state": "valid"});
        if (!metafile) {
            message = lang === 'fr' ? "Aucun metafichier n'a été trouvé " : "Metafile not found";
            console.log("Metafile not found");
            return res.status(404).json({
                'message': message
            });
        }
        console.log('meta file was updated ! ');
        if (metafile.fileType === 'profilePic') {
            jober = typeOwner !== "entreprise" ?
                await particularService.updateParticular(metafile.owner, {
                'profilePic.valid': true
            }) : await  companyService.updateCompany(metafile.owner,
                    {'profilePic.valid': true});
            const textMan = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "La photo de profil rassure les employeurs sur votre identité !  Merci !";
            const textFemale = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "La photo de profil rassure les employeurs sur votre identité. J'espère que vous avez mis une photo qui vous valorise! \n  Merci !";
            text = jober.gender === "Man" ? textMan : textFemale;
        } else if (metafile.fileType === 'identity') {
            jober = typeOwner !== "entreprise" ?
                await particularService.updateParticular(metafile.owner, {
                    'identityCard.valid': true
                }) : await  companyService.updateCompany(metafile.owner,
                    {'identityCard.valid': true});
            text = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "La carte d'identité garantie l'intégrité de vos informations ! Merci !";
        } else if (metafile.fileType === 'driver_permit') {
            jober = await particularService.updateParticular(metafile.owner, {
                'driver_permit.valid': true
            });
            text = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "Le permis de conduire vous ouvre les portes de plusieurs missions ! Merci !";
        } else if (metafile.fileType === 'schoolLevel') {
            jober = await particularService.updateParticular(metafile.owner, {
                'schoolLevel.valid': true
            });
            text = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "Allez postuler dès maintenant à toutes les missions de type Education/Répétion/Bureautique/Service web, etc... ! Merci !";
        } else if (metafile.fileType === 'cv') {
            jober = await particularService.updateParticular(metafile.owner, {
                'cv.valid': true
            });
            text = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "Allez postuler dès maintenant à toutes les missions qui necessitent un cv ! Merci !";
        } else {
            jober = await particularService.getParticular('id', metafile.owner);
            text = "Bonjour " + jober.surname + ".\n" +
                "Nous avons validé le document " + metafile.name + " .\n" + "Allez postuler dès maintenant à toutes les missions ! Merci !";
        }
        let smsJober = {
            from: "JOBAAS",
            to: JSON.stringify(jober.phoneNumber.value),
            text: text
        };
        let notifUrl = '/fr/me/profile';
        joberNotification = {
            receiver: metafile.owner,
            text: text,
            type_event: "fileManager",
            notifUrl: notifUrl
        };
        await smsService.send_notification(smsJober);
        await notificationService.createNotification(joberNotification);
        message = lang === 'fr' ? "Validation du metafichier via l'id" :
            "the metafile was validated by id";
        console.log('the metafile was validated by id : ' + req.params.idMeta);
        return res.status(200).json({
            'message': message
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const rejectFile = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    const reason = req.body.reason ? req.body.reason : '';
    let idMeta = req.params.idMeta;
    let message;
    let text;
    let joberNotification;
    try {
        const metafile = await metafileService.updateMetafile(idMeta, {"state": "rejected", 'reason': reason});
        if (!metafile) {
            message = lang === 'fr' ? "Aucun metafichier n'a été trouvé " : "Metafile not found";
            return res.status(404).json({
                'message': message
            });
        }
        let jober;
        if (metafile.fileType === 'profilePic') {
            jober = await particularService.updateParticular(metafile.owner, {
                'profilePic.valid': false,
            });
        } else if (metafile.fileType === 'identity') {
            jober = await particularService.updateParticular(metafile.owner, {
                'identityCard.valid': false
            });
        } else if (metafile.fileType === 'driver_permit') {
            jober = await particularService.updateParticular(metafile.owner, {
                'driver_permit.valid': false
            });
        } else if (metafile.fileType === 'schoolLevel') {
            jober = await particularService.updateParticular(metafile.owner, {
                'schoolLevel.valid': false
            });
        }else if (metafile.fileType === 'cv') {
            jober = await particularService.updateParticular(metafile.owner, {
                'cv.valid': false
            });
        } else {
            jober = await particularService.getParticular('id', metafile.owner);
        }
        text = "Bonjour " + ".\n" +
            "Nous avons rejeté le document " + metafile.name + " à cause de la raison suivante: <<" + metafile.reason + ">> .\n"
            + "Régularisarisez s'il vous plait votre situation.";
        let smsJober = {
            from: "JOBAAS",
            to: String(jober.phoneNumber.value),
            text: text
        };
        let notifUrl = '/fr/me/profile';
        joberNotification = {
            receiver: metafile.owner,
            text: text,
            type_event: "fileManager",
            notifUrl: notifUrl
        };
        await smsService.send_notification(smsJober);
        await notificationService.createNotification(joberNotification);
        message = lang === 'fr' ? "rejet du metafichier via l'id" :
            "the metafile was invalidated by id";
        console.log('the metafile was invalidated by id : ' + req.params.idMeta);
        console.log('reason  : ' + metafile.reason);
        return res.status(200).json({
            'message': message
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getFileStreamed = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        console.log('id File : ' + req.params.idFile);
        const fileStreamer = await fileService.getStream(req.params.idFile);
        let message;
        if (!fileStreamer) {
            message = lang === 'fr' ? "Aucun fichier n'a été trouvé " : "File not found";
            console.log("File not found");
            return res.status(404).json({
                'message': message
            });
        } else {
            res.set('Content-Type', fileStreamer.type);
            return fileStreamer.stream.pipe(res);
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const processFile = async function (nameFile, meta) {
    console.log('process file function in action');
    const newFile = await fileService.getFile('name', nameFile);
    if (newFile && newFile.length > 0) {
        const idFile = newFile[0]._id;
        console.log('id of the file that was created : ' + idFile);
        meta.fileId = idFile;
        let metafile = await metafileService.createMetafile(meta);
        return metafile;
    } else {
        console.log('an error occurred when trying to get metafile ');
        return null;
    }
};

const processFileAws = async function (nameFile, meta) {
    console.log('process file function in action');
    const newFile = await fileService.getFileAws(nameFile);
    if (newFile.data) {
        meta.bucketName = newFile.data.bucketName;
        meta.bucketKey = newFile.data.bucketKey;
        let metafile = await metafileService.createMetafileAws(meta);
        return metafile;
    } else {
        console.log('an error occurred when trying to get metafile ');
        return null;
    }
};

const getMetaFilesById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const metaFiles = await metafileService.getMetafile('id', req.params.idMeta);
        let message;
        if (!metaFiles) {
            message = lang === 'fr' ? "Aucun meta fichier n'a été trouvé " : "Metafile not found";
            console.log(message);
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === 'fr' ? " Le meta fichier a été trouvé via l'id" : " the metaFile found by id ";
        console.log('the metaFile found by id : ' + req.params.idMeta);
        return res.status(200).json({
            'message': message,
            'data': metaFiles
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateFile = async (req, res) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    let oldFileType;
    let tmpName;
    const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
    let fileState = req.jwt && intercept.length !== 0;
    const typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise" : "particular";
    try {
        let id = req.params.id ? req.params.id : req.jwt.userId;
        const metafile = await metafileService.getMetafile('file Id', req.params.idFile);
        console.log('process of updating file');
        console.log('first step call the metafile : ' + req.params.idFile);
        if (metafile) {
            const file = await fileService.getFileById(req.params.idFile);
            if (file) {
                console.log('second step remove the current file');
                const conn = await mongoose.connection;
                mongoose.set('useCreateIndex', true);
                mongoose.set('useUnifiedTopology', true);
                const gfs = Grid(conn.db, mongoose.mongo);
                await gfs.remove(file, async function (err) {
                    if (err) {
                        console.log(err.message);
                        const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                        return res.status(500).json({
                            'message': error_processing.process(err)
                        });
                    } else {
                        console.log('the file is removed we store the new one');
                        const uploader = await fileService.storeFile();
                        const nameFile = uploader.nameFile;
                        console.log('nameFile : ' + nameFile);
                        await uploader.upload(req, res, async (err) => {
                            if (err) {
                                console.log(err.message);
                                const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
                                return res.status(500).json({
                                    'message': error_processing.process(err)
                                });
                            }
                            const newFile = await fileService.getFile('name', nameFile);
                            if (newFile && newFile.length > 0) {
                                const idFile = newFile[0]._id;
                                console.log('id of the file that was created : ' + idFile);
                                metafile.fileId = idFile;
                                metafile.state = 'invalid';
                                if (req.query.validity) {
                                    metafile.validity = req.query.validity;
                                }
                                if (req.query.fileType && metafile.fileType !== req.query.fileType) {
                                    oldFileType = metafile.fileType;
                                    metafile.fileType = req.query.fileType;
                                    tmpName = metafile.name.split('_');
                                    tmpName = tmpName[0];
                                    metafile.name = createNameFile(tmpName, req.query.fileType);
                                }
                                console.log('new file created');
                                const metaUpdated = await metafileService.updateMetafile(metafile._id, metafile);
                                if (metaUpdated) {
                                    console.log('meta file was updated ! ');
                                    let url;
                                    let urlServer = config.hostname === 'localhost' ?
                                        'http://' + config.hostname + ':' + config.port + '/api/v1/fileManager/' + metafile.fileId + '/stream'
                                        : 'https://' + config.hostname + '/api/v1/fileManager/' + metafile.fileId + '/stream';
                                    // we add www for prod env
                                    url = config.env === './production' ? 'https://www.' + config.hostname + '/api/v1/fileManager/' + metafile.fileId + '/stream'
                                        : urlServer;
                                    console.log(url);
                                    if (metaUpdated.fileType === 'profilePic') {
                                        console.log("profilePic");
                                        if(typeOwner === "entreprise"){
                                            await companyService.updateCompany(id, {
                                                'profilePic.url': url,
                                                'profilePic.valid': fileState
                                            });
                                        }else{
                                            await particularService.updateParticular(id, {
                                                'profilePic.url': url,
                                                'profilePic.valid': fileState
                                            });
                                        }
                                    } else if (req.query.fileType === 'logoBlogArticle') {

                                        await blogArticleService.getAllBlogArticles({});
                                        await blogArticleService.updateBlogArticle(req.params.idBlogArticle, {'headImageUrl': url}, req.jwt.userId)
                                        await metafileService.updateMetafile(metafile._id, {"state": "valid"});
                                    } else if (metaUpdated.fileType === 'identity') {
                                        if(typeOwner === "entreprise"){
                                            await companyService.updateCompany(id, {
                                                'identityCard.url': url,
                                                'identityCard.valid': fileState
                                            });
                                        }else{
                                            await particularService.updateParticular(id, {
                                                'identityCard.url': url,
                                                'identityCard.valid': fileState
                                            });
                                        }
                                    } else if (metaUpdated.fileType === 'driver_permit') {
                                        await particularService.updateParticular(id, {
                                            'driver_permit.url': url,
                                            'driver_permit.valid': fileState
                                        });
                                    } else if (metaUpdated.fileType === 'schoolLevel') {
                                        await particularService.updateParticular(id, {
                                            'schoolLevel.url': url,
                                            'schoolLevel.valid': fileState
                                        });
                                    } else if (metaUpdated.fileType === 'cv') {
                                        await particularService.updateParticular(id, {
                                            'cv.url': url,
                                            'cv.valid': fileState
                                        });
                                    }
                                    const environment = config.env;
                                    if (Number(no_mail ) === 0 && environment !== './dev' && !fileState) {
                                        const ValidationMessage=`le document avec l'id ${metafile.fileId} est en attente de validation ${url}`;
                                        let mailTemplate = fs.readFileSync(path.join(__dirname, "../common/mails/file_validation_fr.html"), "utf8");
                                        const footer  = fs.readFileSync(path.join(__dirname, '/../common/mails/footer.html'), 'utf8');
                                        mail = mailTemplate ;
                                        mail = mail.replace('#footer', footer);
                                        mail = mail.replace("#lien", url);
                                        mail = mail.replace("#message",ValidationMessage);
                                        await emailService.nodemailer_mailgun_sender({
                                            "from": 'Jobaas <no_reply@jobaas.cm>',
                                            "to":it_mails,
                                            "subject": `[${environment}] Demande de validation du fichier  ${metafile.fileId}`,
                                            "html":mail
                                        });
                                    }
                                    message = lang === 'fr' ? "Mise à jour du fichier via l'id" :
                                        "the file was updated by id";
                                    console.log('the file was updated by id : ' + req.params.idFile);
                                    return res.status(200).json({
                                        'message': message,
                                        'data': {url: url},
                                    });
                                } else {
                                    message = lang === 'fr' ? "Error la mise à jour du fichier via l'id"
                                        : "the file was not updated by id";
                                    console.log('the file was not updated by id : ' + req.params.idFile);
                                    return res.status(500).json({
                                        'message': message
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                console.log("No file with this ID " + req.params.idFile);
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
                return res.status(500).json({
                    'message': error_processing.process(err)
                });
            }
        } else {
            message = lang === 'fr' ? "Ce fichier n'existe pas !" : "this file does not exist yet !";
            return res.status(404).json({
                'message': message
            });
        }
    } catch (e) {
        console.log(e.message);
        const environment = config.env;
        if (Number(no_mail === 0) && environment !== './dev') {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${environment}] Erreur Backend dans la mise à jour des fichiers`,
                "html": `Erreur consulter les logs`
            });
        }
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateFileAws = async (req, res, next) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    let name = req.jwt.name;
    const busboy = new Busboy({headers: req.headers});
    let extension;
    try {
        let ownerId = req.params.id ? req.params.id : req.jwt.userId;
        if(!req.params.bucketKey  || req.params.bucketKey === 'null'){
            return next()
        }
        const metafile = await metafileService.getMetafileAws(req.params.bucketKey);
        console.log('process of updating file in s3 bucket');
        console.log('first step call the metafile via bucketKey: ' + req.params.bucketKey);
        if (metafile) {
            let deletedFile = fileService.deleteFileAws(req.params.bucketKey);
            if (deletedFile) {
                name = createNameFile(name, metafile.fileType);
                let data;
                const file = req.files.file;
                //TODO find why the file is renamed blob
                extension = "."+file.mimetype.split("/")[1] //path.extname(file.name);
                name = name + extension;
                metafile.name = name
                metafile.bucketKey =  metafile.bucketKey.includes(extension) ?  metafile.bucketKey+extension :  metafile.bucketKey 
                busboy.on('finish', async function () {
                    console.log('Loading of stream file in req finished');
                    data = await fileService.storeFileAws(metafile, file.data);
                    metafile.bucketKey = data.data.bucketKey;
                    console.log('uploader process for s3 bucket called');
                    let metafileUpdated = await metafileService.updateMetafile(metafile._id, metafile);
                    console.log('after uploading process for s3 bucket');
                    let url;
                    if (metafileUpdated) {
                        message = lang === 'fr' ? "Mise à jour du fichier réussi" : "File successfully updated";
                        console.log("new file was created");
                        await updateUserUrlFile(metafileUpdated,null);  
                        return res.status(200).json({
                            'message': message,
                            'data': {
                                'fileUploaded': true,
                                'bucketName': metafileUpdated.bucketName,
                                'bucketKey': metafileUpdated.bucketKey
                            },
                        });
                    } else {
                        if (Number(no_mail === 0)) {
                            await emailService.nodemailer_mailgun_sender({
                                "from": 'Jobaas <no_reply@jobaas.cm>',
                                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                                "subject": `[${config.env}]Erreur Backend traitement des fichiers`,
                                "html": `Erreur consulter les logs`
                            });
                        }
                        console.log('an error occured in uploading file');
                        const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                        return res.status(500).json({
                            'message': error_processing.process(err)
                        });
                    }
                });
                req.pipe(busboy);
            }
        } else {
            message = lang === 'fr' ? "Ce fichier n'existe pas !" : "this file does not exist yet !";
            return res.status(404).json({
                'message': message
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteFile = async (req, res) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const Metafile = await metafileService.getMetafile('fileId', req.params.idFile);
        if (Metafile) {
            const file = await fileService.getFileById(Metafile.fileId);
            if (file) {
                const conn = await mongoose.connection;
                mongoose.set('useCreateIndex', true);
                mongoose.set('useUnifiedTopology', true);
                const gfs = Grid(conn.db, mongoose.mongo);
                await gfs.remove(file, async function (err) {
                    if (err) {
                        console.log(err.message);
                        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
                        return res.status(500).json({
                            'message': error_processing.process(err)
                        });
                    } else {
                        const result = await metafileService.deleteMetafile(req.params.idMeta);
                        if (result) {
                            message = lang === 'fr' ? "Les meta fichiers ont été mis à jour via l'id"
                                : "the metaFiles was deleted by id ";
                            console.log('the metaFiles was deleted by id : ' + req.params.idMeta);
                            return res.status(200).json({
                                'message': message
                            });
                        }
                    }
                });
            } else {
                message = lang === 'fr' ? "Aucun fichier n'a été trouvé " : "File not found";
                console.log("File not found by id " + Metafile.fileId);
                return res.status(404).json({
                    'message': message
                });
            }
        } else {
            message = lang === 'fr' ? "Aucun meta fichier n'a été trouvé via l'id"
                : "metafile not found  id";
            console.log('no metafile found by id : ' + req.params.idMeta);
            return res.status(404).json({
                'message': message
            });
        }
    } catch (e) {
        console.log(e.message);
        const environment = config.env;
        if (Number(no_mail === 0) && environment !== './dev') {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": 'leonelelanga@yahoo.fr, cto@jobaas.cm',
                "subject": `[${environment}]Erreur Backend dans la suppression des fichiers`,
                "html": `Erreur consulter les logs`
            });
        }
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteFileAws = async (req, res) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const Metafile = await metafileService.getMetafileAws(req.params.bucketKey);
        if (Metafile) {
            let deletedFile = fileService.deleteFileAws(req.params.bucketKey);
            if (deletedFile) {
                let deletedMeta = await metafileService.deleteMetafile(Metafile._id);
                if (result) {
                    message = lang === 'fr' ? "Le fichier sur s3 bucket et ses méta fichiers ont été supprimés par bucketKey"
                        : "the file on s3 bucket and metaFiles were deleted by id ";
                    console.log("the file on s3 bucket and metaFiles were deleted by bucketKey " + req.params.bucketKey);
                    return res.status(200).json({
                        'message': message
                    });
            }
        } else {
            message = lang === 'fr' ? "Aucun meta fichier n'a été trouvé via le bucketKey"
                : "metafile not found  bucketKey";
            console.log('no metafile found by bucketKey : ' + req.params.bucketKey);
            return res.status(404).json({
                'message': message
                });
            }
        }
    }catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteBucket = async (req, res) => {
    let result;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        result = fileService.deleteBucket();
        if (result) {
            return res.status(200).json({"message": "bucket was successfully deleted"});
        } else {
            return res.status(500).json({"message": "Something went wrong. Please, try again later"})
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
    });
}};

const migrateToS3 = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let data;
    const busboy = new Busboy({headers: req.headers});
    let meta = {"_id": req.params.metaId};
    let metafileUpdated;
    try {
        let extension = req.body.extension;
        extension = mime.extension(extension.split(":")[1].trim());
        const file = req.files.file;
        busboy.on('finish', async function() {
    
            console.log('Loading of stream file in req finished');
            console.log('Start of streaming file toward s3 bucket');
            data = await fileService.storeFileAws({"name": req.body.name+'.'+extension}, file.data);
            console.log('End od streaming file toward s3 bucket');
            meta.bucketName = data.data.bucketName
            meta.bucketKey = data.data.bucketKey

            const filePath = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port+"/api/v1/fileManager/"+meta.bucketKey+"/streamAws" : 'https://' + config.hostname+"/api/v1/fileManager/"+meta.bucketKey+"/streamAws";

            if (!data.data) {
                return res.status(500).json({"message":"Fichier avec le metafichier d'id" + meta['_id'] + " n'a pas pu être migré vers s3 bucket"});
            } else {
                meta["bucketName"] = data.data.bucketName;
                meta["bucketKey"] = data.data.bucketKey;
                metafileUpdated = await metafileService.updateMetafile(meta['_id'], meta);
                await updateUserUrlFile(metafileUpdated,null); 

          
                console.log("Fin de migration vers le bucket S3 du fichier avec le métafichier " + meta._id)
                return res.status(200).json({"message": "Fin de migration vers le bucket S3 du fichier avec le métafichier " + meta._id});
            }
        });
        req.pipe(busboy);
    } catch(e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
    });
    }

};

module.exports = {
    getMetafileById: getMetaFilesById,
    updateFile: updateFile,
    updateMetafile: updateMetafile,
    updateFileAws: updateFileAws,
    getAllMetaFiles: getAllMetaFiles,
    getAllFilesAws: getAllFilesAws,
    getFileStreamed: getFileStreamed,
    getFileAws: getFileStreamedAws,
    createFile: createFile,
    createFileAws : createFileAws,
    createMultipleFileAws: createMultipleFileAws,
    validateFile: validateFile,
    rejectFile: rejectFile,
    deleteFile: deleteFile,
    deleteFileAws: deleteFileAws,
    createBucket: createBucket,
    deleteBucket: deleteBucket,
    migrationS3: migrateToS3
};
