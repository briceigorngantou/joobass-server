//config
const error_processing = require('../common/utils/error_processing');
const jobService = require('../services/job');
const applicationService = require('../services/application');
const contractService = require('../services/contract');

//TODO ADD THIS TO UNIT TEST
const cancelContract = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const contractBeforeDelete = await contractService.getContract(req.params.idContract);
        message = req.query.lang === "fr" ? "cet contrat a déjà été annulée" : "this  contract has already been cancelled";
        if (contractBeforeDelete.state === "failed") {
            return res.status(409).json({
                'message': message
            });
        }
        const application = await applicationService.getApplicationByEmployeeAndJob(contractBeforeDelete.employee, contractBeforeDelete.job);
        const contract = await contractService.updateContract(req.params.idContract, {"state": "failed"});
        const job = await jobService.getJob(contract.job);
        // we create an evaluation with grade 0 for the jober that cancel the job.
        if (contract) {
                const isContractCancelled = await contractService.cancelContract(application, job, contract);
                if(isContractCancelled){
                    message = req.query.lang === "fr" ? "Le contrat a été annulée" : "the contract has been cancelled";
                    console.log('the contract was cancelled by id : ' + req.params.idContract);
                    return res.status(200).json({
                        'message': message
                    });
                }else{
                    message = req.query.lang === "fr" ? "Erreur durant l'annulation du contrat " : "Error in contract cancellation";
                    return res.status(500).json({
                        'message': message
                    });
                }
        } else {
            console.log('no contract was found by id : ' + req.params.idContract);
            const err = new error_processing.BusinessError(" ", "", 404, "classic", lang);
            return res.status(404).json({
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

const createContract = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    const idJob = req.params.idJob ;
    let message;
    try {
        // create the contract service
        const currentJob = await jobService.getJob(idJob);
        req.body.employer = currentJob.employer;
        req.body.paymentPerTransaction = currentJob.employerPayment;
        req.body.job = req.params.idJob;
        req.body.nbTransactionsTodo = currentJob.frequency.isRegular === false ? 2 : req.body.nbTransactionsTodo;
        const contract = await contractService.createContract(req.body);
        message = lang === 'fr' ? "Création d'un nouveau contrat" : 'New contract created';
        return res.status(200).json({
            'message': message,
            'data': {'id': contract.id}
        })
    } catch (e) {
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


module.exports = {
    cancelContract: cancelContract,
    createContract: createContract
};
