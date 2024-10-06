const LitigationModel = require('../configs/models/litigation');
const processing = require('../common/utils/processing');

const createLitigation = async (litigation) => {
    let result;
    const newLitigation = new LitigationModel(litigation);
    result = await newLitigation.save();
    return {id: result._id};
};

const getAllLitigations = async (perPage, page, filterParams, pagination = true) => {
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    let length = await LitigationModel.find(filterParams).countDocuments();
    let result = pagination ? await LitigationModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec()
        : await LitigationModel.find(filterParams).select('-__v').lean().exec();
    return {"litigations":result,"length":length};
};

const updateLitigation = async (id, litigation) => {
    let currentLitigation = await LitigationModel.findByIdAndUpdate(id,
        processing.dotNotate(litigation),
        {
            new: true,
            useFindAndModify: false
        }).select('-_id -__v').exec();
    return currentLitigation;
};

const getLitigation = async (id) => {
    const currentLitigation = await LitigationModel.findById(id).select('-_id -__v').lean().exec();
    return currentLitigation;
};

const deleteLitigation = async (id) => {
    let result = await LitigationModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteLitigation: deleteLitigation,
    getLitigation: getLitigation,
    updateLitigation: updateLitigation,
    getAllLitigations: getAllLitigations,
    createLitigation: createLitigation,
};
