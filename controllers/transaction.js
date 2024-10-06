const jobService = require('../services/job');
const particularService = require('../services/particular');
const companyService = require('../services/company');
const notificationService = require('../services/notification');
const error_processing = require('../common/utils/error_processing');
const transactionService = require('../services/transaction');
const email_sender = require('../services/email_sender');
const contractStatService = require('../services/contract');
const smsService = require('../services/sms');
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const _ = require('lodash');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const it_mails = config.it_mails;

const getAllTransactions = async (req, res) => {
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.query.receiver = req.jwt.userId;
        }
        const transactions = await transactionService.getAllTransactions(limit, page, req.query);
        return res.status(200).json({
            'data': transactions
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const createTransaction = async (req, res) => {
    console.log('transaction controller loaded');
    const mode = req.query.mode ? req.query.mode : 'auto';
    const transaction = req.body;
    let jobTitle;
    let transactionType;
    try {
        const currentJob = await jobService.getJob(req.body.job);
        jobTitle = currentJob.title;
        transactionType = req.body.type;
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            console.log('create transaction by an user');
            req.body.emitter = req.jwt.userId;
        } else {
            console.log('create transaction by admin');
        }
        const idTransaction = await transactionService.createTransaction(transaction);
        console.log('transaction created in database');
        if (req.body.type && req.body.type === "refund" && idTransaction) {
            await refundProcess(currentJob.title, currentJob.employer, currentJob.typeEmployer);
            console.log('notification for a refund was made');
            if(Number(no_mail) === 0){
                await email_sender.nodemailer_mailgun_sender({
                    "from": 'Jobaas  <no_reply@jobaas.cm>',
                    "to": it_mails.concat(["info@jobaas.cm"]),
                    "subject": "Succès transaction JOBAAS",
                    "html": `Validation de la transaction du job ${jobTitle} de type ${transactionType}`
                });
            }
            return res.status(200).json({
                'data': idTransaction
            });
        }
        else if (req.body.type === 'fees') {
            await feesProcess(currentJob.title, currentJob.employer, req.body.job,
                currentJob.typeEmployer, mode);
            console.log("fees process succeed");
            if(Number(no_mail) === 0){
                await email_sender.nodemailer_mailgun_sender({
                    "from": 'Jobaas  <no_reply@jobaas.cm>',
                    "to": it_mails.concat(["info@jobaas.cm"]),
                    "subject": "Succès transaction JOBAAS",
                    "html": `Validation de la transaction du job ${jobTitle} de type ${transactionType}`
                });
            }
            return res.status(200).json({
                'data': idTransaction
            });
        }
    } catch (e) {
        console.log(e.message);
        if(Number(no_mail) === 0){
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas  <no_reply@jobaas.cm>',
                "to": "info@jobaas.cm, leonelelanga@yahoo.fr, cto@jobaas.cm",
                "subject": `[${config.env}]Echec transaction JOBAAS`,
                "html": `Une erreur est survenue durant la transaction du job ${jobTitle} de type ${transactionType}`
            });
        }
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const updateTransaction = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    if (!req.body.idCharge) {
        delete req.body.state;
    }
    try {
        await transactionService.getTransaction(req.params.idTransaction);
        const transaction = await transactionService.updateTransaction(req.params.idTransaction, req.body);
        let message;
        if (!transaction) {
            console.log("Transaction not found by id :" + req.params.idTransaction);
            const err = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, 'Transaction');
            return res.status(err.code).json({
                'message': error_processing.process(err)
            });
        }
        message = req.query.lang === 'fr' ? 'Mise à jour de la transaction par id' : 'The transaction was updated by id';
        console.log('the transaction was updated by id : ' + req.params.idTransaction);
        return res.status(200).json({
            'message': message,
            'data': transaction
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }

};

const deleteTransaction = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const transaction = await transactionService.deleteTransaction(req.params.idTransaction);
        message = req.query.lang === "fr" ? 'La transaction a été supprimée par id ' : 'The transaction was deleted by id';
        if (transaction) {
            console.log('the transaction was deleted by id : ' + req.params.idTransaction);
            return res.status(200).json({
                'message': message
            });
        } else {
            console.log("Transaction not found by id :" + req.params.idTransaction);
            const err = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, 'Transaction');
            return res.status(err.code).json({
                'message': error_processing.process(err)
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


const getTransactionById = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        const transaction = await transactionService.getTransaction(req.params.idTransaction);
        let message;
        if (!transaction) {
            console.log("Transaction not found by id :" + req.params.idTransaction);
            const err = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, 'Transaction');
            return res.status(err.code).json({
                'message': error_processing.process(err)
            });
        }
        message = req.query.lang === "fr" ? "La transaction a été trouvée " : "the transaction found";
        console.log('the transaction found by id : ' + req.params.idTransaction);
        return res.status(200).json({
            'message': message,
            'data': transaction
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(404).json({
            'message': error_processing.process(err)
        });
    }
};

const feesProcess = async(jobTitle, employerId, jobId, typeEmployer, transactionMode) =>{
    let textNotification = "Votre paiement a été pris en compte avec succès pour les frais de la mission <<"
        + jobTitle + ">>";
    const jobProviderNotification = {
        receiver: employerId,
        text: textNotification,
        typeEvent: "transaction",
        notifUrl: "/fr/transactions"
    };
    await jobService.updateJob(jobId, {'feesPaid': true, 'isValid': true, 'state': 'validated'});
    await contractStatService.createContract({
        employer: employerId,
        job: jobId,
        nbTransactionsDone: 1,
        nbTransactionsTodo: 1,
        state: 'in_progress'
    })
    await notificationService.createNotification(jobProviderNotification);
    if (Number(no_mail) === 0) {
        //TODO TEMPLATE MAIL REFUND FOR ALL CASES OF SMS FOR COMPANY
        if (typeEmployer === 'particular') {
            const phoneNumber = await particularService.getParticularPhoneNumber(employerId);
            console.log("payment for fees done");
            await smsService.send_notification({
                "text": textNotification,
                "to": phoneNumber.toString()
            });
        }
        if(transactionMode === 'auto' && Number(no_mail) === 0){
            const environment = config.env;
            await email_sender.nodemailer_mailgun_sender(
                {
                    "from": 'Jobaas  <no_reply@jobaas.cm>',
                    "to": "info@jobaas.cm",
                    "subject": `[${environment}] Validation de paiement de frais pour une mission`,
                    "html": "Le paiement de la mission dont l'id est << " + jobId + " >> vient d'être effectué. La mission peut être en ligne. "
                }
            )
        }
    }
};

const refundProcess = async(jobTitle, employerId, typeEmployer, idJob) =>{
    console.log("Refund process called");
    let textNotification = "Le remboursement du job <<" + jobTitle + ">>  a été finalisé par Jobaas et " +
        "votre paiement est en route. \n Merci d'avoir fait confiance à Jobaas ! ";
    const jobProviderNotification = {
        receiver: employerId,
        text: textNotification,
        typeEvent: "transaction",
        notifUrl: "/fr/transactions?type=refund"
    };
    await contractStatService.updateContract(idJob,
        {"nbTransactionsDone": 2, "state": "failed"}, 'idJob')
    await notificationService.createNotification(jobProviderNotification);
    if (Number(no_mail) === 0) {
        //TODO TEMPLATE MAIL REFUND FOR FOR COMPANY
        if (typeEmployer === 'particular') {
            const phoneNumber = await particularService.getParticularPhoneNumber(employerId);
            console.log("payment to employer done");
            await smsService.send_notification({
                "text": textNotification,
                "to": phoneNumber.toString()
            });
        }
    }
};


module.exports = {
    getAllTransactions: getAllTransactions,
    createTransaction: createTransaction,
    deleteTransaction: deleteTransaction,
    updateTransaction: updateTransaction,
    getTransactionById: getTransactionById,
};
