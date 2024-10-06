const mongoose = require('mongoose');
const transactionSchema = require('../schemas/transaction');

Transaction = mongoose.model('Transaction', transactionSchema);
Transaction.syncIndexes().then(function () {
    console.log("sync index done for Transaction");
});
module.exports = Transaction;

