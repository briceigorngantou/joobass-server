const StatsEmployeeModel = require('../configs/models/statsEmployee');
const processing = require('../common/utils/processing');

const createStatsEmployee = async (statsEmployee) => {
    const newStatsEmployee = new StatsEmployeeModel(statsEmployee);
    let result = await newStatsEmployee.save();
    return {id: result._id};
};

const getAllStatsEmployees = async (perPage, page, filterParams, isParticularDataAdded = false) => {
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    // Join
    let populateCollection = [{
    path: 'job',
    select: 'title price town street  _id slug'
    }];
    let result = isParticularDataAdded ? await StatsEmployeeModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec()
                  : await StatsEmployeeModel.find(filterParams).limit(perPage).skip(perPage * page).populate(populateCollection).select('-__v').lean().exec()     ;
    let length = await StatsEmployeeModel.find(filterParams).countDocuments();
    return {"statsEmployers": result, "length": length};
};

const updateStatsEmployee = async (userId, statsEmployee,isDotNotate = true) => {
    let currentStatsEmployee = isDotNotate ? await StatsEmployeeModel.findOneAndUpdate({userId: userId},
            processing.dotNotate(statsEmployee),
            {
                new: true,
                useFindAndModify: false
            }).select('-_id -__v').exec()
            : await StatsEmployeeModel.findOneAndUpdate({userId: userId},statsEmployee,
                {
                    new: true,
                    useFindAndModify: false
                }).select('-_id -__v').exec();
    return currentStatsEmployee;
};

const getStatsEmployee = async (id) => {
    const currentStatsEmployee = await StatsEmployeeModel.findById(id).select('-_id -__v').lean().exec();
    return currentStatsEmployee;
};

const getStatsByUser = async (userId) => {
    let currentStatsEmployee = await StatsEmployeeModel.findOne({userId: userId}).select('-_id -__v -userId').lean().exec();
        return currentStatsEmployee;
};

const deleteStatsEmployee = async (id) => {
    let result = await StatsEmployeeModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteStatsEmployee: deleteStatsEmployee,
    getStatsEmployee: getStatsEmployee,
    updateStatsEmployee: updateStatsEmployee,
    getAllStatsEmployees: getAllStatsEmployees,
    createStatsEmployee: createStatsEmployee,
    getStatsByUser: getStatsByUser
};
