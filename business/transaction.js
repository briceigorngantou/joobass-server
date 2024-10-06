const jobService = require('../services/job');
const error_processing = require('../common/utils/error_processing');
const contractService = require('../services/contract');

// Verify the state of the contract
const isContractClosedOrFailed = async (req, res, next) => {
    const contract = await contractService.getContractByJob(req.body.job);
    let error;
    if (contract) {
        if (contract.state === "closed") {
            error = new error_processing.BusinessError("The contract is closed !", "Le contrat est clos", 400, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
            });
        }else if (contract.state === "paid") {
            error = new error_processing.BusinessError("No transaction is accepted for a paid contract except refund", "Aucun paiment n'est accepté pour un contrat payé", 400, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
            });
        } else if (contract.state === "failed") {
            if (req.body.type === "refund") {
                next();
            } else {
                error = new error_processing.BusinessError("No payment is accepted for failed contract", "Aucun paiment n'est accepté pour un contrat en echec sauf un remboursement", 400, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }
        }
    } else {
        next();
    }
};

const isPaymentTypeRight = async (req, res, next) => {
    let error;
    if (req.body.type !== "fees" && req.body.type !== "refund") {
            error = new error_processing.BusinessError("The payment type is wrong", "Le type de paiement n'est pas accepté", 400, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
            });
    } else {
        next();
    }
};


const isAmountRight = async (req, res, next) => {
    const job = await jobService.getJob(req.body.job);
    let error;
    if (job) {
        if (req.body.type === "fees") {
            if( req.body.payment >= (job.employerPayment*0.70)){
                console.log("rules respect for amount fees")
                next();
            }else{
                error = new error_processing.BusinessError("The amount is not acceptable", "La sommme n'est pas acceptable", 400, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }

        }else {
             const contract = await contractService.getContractByJob(req.body.job)
            if( req.body.payment <= (contract.paymentPerTransaction)){
                console.log("rules respect for amount refund")
                next();
            }else{
                error = new error_processing.BusinessError("The amount is not acceptable", "La sommme n'est pas acceptable", 400, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }
        }
    } else {
        const err = new error_processing.BusinessError("Job id doesn't exist", "Aucune mission associée à cette id", 500, "business", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    isContractClosedOrFailed: isContractClosedOrFailed,
    isPaymentTypeRight: isPaymentTypeRight,
    isAmountRight: isAmountRight

};
