const ContractModel = require('../configs/models/contract');
const applicationService = require('./application');
const evaluationService = require('./evaluation');
const jobService = require('./job');
const mailService = require('./email_sender');
const notificationService = require('./notification');
const employeeStatService = require('./statsEmployee');
const config = require('../configs/environnement/config');
const transactionService = require('./transaction');

const createContract = async (Contract) => {
    const newContract = new ContractModel(Contract);
    let result = await newContract.save();
    return {id: result._id};
};

const getAllContracts = async (perPage, page, filterParams, pagination = true) => {
    delete filterParams.lang;
    delete filterParams.limit;
    delete filterParams.page;
    //we  handle pagination
    let result = pagination ? await ContractModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec()
        : await ContractModel.find(filterParams).select('-__v').lean().exec();
    let length = await ContractModel.find(filterParams).countDocuments();
    return {"contracts": result, "length": length};
};

const updateContract = async (id, contract, type="idContract") => {
    console.log('call service update contract by id : ' + id);
    console.log(contract);
    let result;
    const currentContract = type === "idContract" ?
        await ContractModel.findById(id).exec() :
        await ContractModel.findOne({"job": id}).exec();
    if (currentContract) {
        currentContract.set(contract);
        result = await currentContract.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
    }else{
        result = null;
    }
    return result;
};

const getContract = async (id) => {
    const currentContract = await ContractModel.findById(id).select('-__v').lean().exec();
    return currentContract;
};

const getContractByJob = async (employee, job) => {
    const currentContract = await ContractModel.findOne({
        'job': job
    }).select('-__v ').lean().exec();
    return currentContract;
};

const NbContractCompletedByEmployerAndJob = async (employer, job) => {
    try {
        const currentContract = await ContractModel.find({
            'employer': employer,
            'job': job,
            'state': 'paid'
        }).countDocuments();
        return currentContract;
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

const deleteContract = async (id) => {
    let result = await ContractModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

const cancelContract = async(application, job, contract, lang) => {
    try{
        await applicationService.updateApplication(application._id, {state: "cancelled"});
        if(job.frequency.isRegular === false){
            const contracts = await getAllContracts(4, 0,
                {"employee": application.employee, "job": application.job});
            await updateContract(contracts.contracts[0]._id, {"state": "failed"});
            const transaction = await transactionService.getAllTransactions(2, 0, {
                "receiver": application.employee,
                "job": application.job
            });
            await transactionService.updateTransaction(transaction.transactions[0]._id, {"receiver": null});
        }
        await jobService.updateJob(job._id, {nbPlacesLeft: job.nbPlacesLeft + 1});
        const evaluation = {
            evaluator: job.employer,
            evaluated: application.employee,
            job: application.job,
            jobComment: "cancel contract",
            grade: 0,
            typeEvaluation: 'employee',
            typeEvaluator: job.typeEmployer,
            serviceGrade: 2,
            serviceComment: "cette évaluation est autogénérée suite à une annulation du contrat"
        };
        await evaluationService.createEvaluation(evaluation);
        let text = lang === 'en' ? " the  contract  with id " + contract._id + " has been cancelled"
            : " Le contrat avec l'id " + contract._id + " a été annulé";
        const jobProviderNotification = {
            receiver: job.employer,
            text: text,
            type_event: "cancel_contract",
            notifUrl: '/fr/contracts'
        };
        await notificationService.createNotification(jobProviderNotification);
        // We notify all the controllers
        await mailService.nodemailer_mailgun_sender(
            {
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": ['leonelelanga@yahoo.fr', 'info@jobaas.cm'],
                "subject": `[${config.env}] Annulation de contrat `,
                "html": text
            }
        );
        // reduce mean rate base
        const delay = Math.abs(job.startDate - new Date()) / 36e5;
        const deltaMean = delay < 72 ? -1 : -0.5;
        let statEmployee = await employeeStatService.getStatsByUser(contract.employee);
        //updated
        // we create an evalution
        await employeeStatService.updateStatsEmployee(contract.employee, {
            "meanRating": statEmployee.meanRating + deltaMean,
            nbJobCancelled: statEmployee.nbJobCancelled + 1,
            nbEvaluations: statEmployee.nbEvaluations + 1
        });
        return true;
    }catch (e) {
        console.log(e.message);
        return false;
    }
};


module.exports = {
    deleteContract: deleteContract,
    getContract: getContract,
    updateContract: updateContract,
    getAllContracts: getAllContracts,
    createContract: createContract,
    cancelContract: cancelContract,
    getContractByJob: getContractByJob,
    nbContractCompletedByEmployerAndJOb: NbContractCompletedByEmployerAndJob
};
