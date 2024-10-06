const StatsEmployerModel = require('../configs/models/statsEmployer');
const processing = require('../common/utils/processing');

const createStatsEmployer = async (statsEmployer) => {
    const newStatsEmployer = new StatsEmployerModel(statsEmployer);
    let result = await newStatsEmployer.save();
    return {id: result._id};
};

const getAllStatsEmployers = async (perPage, page, filterParams, pagination = true) => {
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    let length = await StatsEmployerModel.find(filterParams).countDocuments();
    let result = await StatsEmployerModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    return {"statsEmployers": result, "length": length};
};

const updateStatsEmployer = async (userId, statsEmployer) => {
    let currentStatsEmployer = await StatsEmployerModel.findOneAndUpdate({'userId': userId},
            processing.dotNotate(statsEmployer),
            {
                new: true,
                useFindAndModify: false
            }).select('-_id -__v').exec();
    return currentStatsEmployer;
};

const getStatsEmployer = async (id) => {
    const currentStatsEmployer = await StatsEmployerModel.findById(id).select('-_id -__v').lean().exec();
    return currentStatsEmployer;
};

const getStatsByUser = async (userId) => {
    const currentStatsEmployer = await StatsEmployerModel.findOne({'userId': userId}).select('-_id -__v -userId').lean().exec();
    return currentStatsEmployer;
};

const deleteStatsEmployer = async (id) => {
    let result = await StatsEmployerModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteStatsEmployer: deleteStatsEmployer,
    getStatsEmployer: getStatsEmployer,
    updateStatsEmployer: updateStatsEmployer,
    getAllStatsEmployers: getAllStatsEmployers,
    createStatsEmployer: createStatsEmployer,
    getStatsByUser: getStatsByUser
};
