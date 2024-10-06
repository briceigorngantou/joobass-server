const LogModel = require('../configs/models/log');


const createLog = async (log) => {
    const newLogModel = new LogModel(log);
    let result = await newLogModel.save();
    console.log('create  Log service   by id : ' + result._id);
    return result._id;
};

const getAllLogs = async (perPage, page, filterParams, pagination = true) => {
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;

    for (let [key, value] of Object.entries(filterParams)) {
        if( typeof value == "string" ){
            if ((new Date(value) ).toString() === "Invalid Date") {
                filterParams[key] = new RegExp(value+".*", "i")

            }
        }
    }
    let result = !pagination ? await LogModel.find(filterParams).select('-__v').lean().exec()
        : await LogModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    let length = await LogModel.find(filterParams).countDocuments();
    return {"logs": result, "length": length};
};

const updateLog = async (id, log, state = 1) => {
    let result;
        let currentLog;
        currentLog = await LogModel.findById(id).exec();
        
    if (currentLog) {
        currentLog.set(opening);
        result = await currentLog.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
        }
        console.log('update service log  by id : ' + id);
    return result;
};

const getLog = async (id) => {
    let log;
    log = await LogModel.findById(id).select('-__v').lean().exec();
     //Increment View
     await LogModel.findOneAndUpdate( {"_id":id},{ $inc: { "nbViews" : 1 } }) ;
     console.log('get log  service by  id '+id);
     return log;
};

const deleteLog = async (id) => {
    let result;
    result = await LogModel.deleteOne({'_id': id}).exec();
     return result.deletedCount > 0;
    
};

module.exports = {
    createLog:createLog,
    getAllLogs : getAllLogs,
    getLog: getLog,
    deleteLog : deleteLog ,
    getLog: getLog,
    updateLog:updateLog
};
