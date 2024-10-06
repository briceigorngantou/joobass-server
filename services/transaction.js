const TransactionModel = require('../configs/models/transaction');
const processing = require('../common/utils/processing');

const createTransaction = async (transaction) => {
    let result;
    const newTransaction = new TransactionModel(transaction);
    result = await newTransaction.save();
    return {id: result._id};
};

const getAllTransactions = async (perPage, page, filterParams, pagination = true) => {
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    let length = await TransactionModel.find(filterParams).countDocuments();

    //we handle pagination
    let result = pagination ? await TransactionModel
            .find(filterParams)
            .limit(perPage)
            .skip(perPage * page)
            .select('-__v')
            .lean()
            .exec()
        : await TransactionModel.find(filterParams).select('-__v').lean().exec();
    return {"transactions":result,"length":length};
};

const updateTransaction = async (id, transaction) => {
    let currentTransaction = await TransactionModel.findByIdAndUpdate(id,
        processing.dotNotate(transaction),
        {
            new: true,
            useFindAndModify: false
        }).select('-_id -__v').lean().exec();
    return currentTransaction
};

const getTransaction = async (id) => {
    const currentTransaction = await TransactionModel.findById(id).select('-_id -__v').lean().exec();
    return currentTransaction;
};

const deleteTransaction = async (id) => {
    let result;
    result = await TransactionModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

const getNbTransactionByJobByEmployee = async (idEmployee, idJob) => {
    let nbTransactions = await TransactionModel.find({
        "employee": idEmployee,
        "job": idJob
    }).countDocuments();
    return nbTransactions;
};

module.exports = {
    deleteTransaction: deleteTransaction,
    getTransaction: getTransaction,
    updateTransaction: updateTransaction,
    getAllTransactions: getAllTransactions,
    createTransaction: createTransaction,
    getNbTransactionByJobByEmployee: getNbTransactionByJobByEmployee
};
