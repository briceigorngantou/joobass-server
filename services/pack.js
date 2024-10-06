const PackModel = require('../configs/models/pack');
const {packLevelType} = require("../common/utils/enum");

const createPack = async (pack) => {
    const newPack = new PackModel(pack);
    let result = await newPack.save();
    return {id: result._id};
};

const getPreviousPackLevel = async (levelType) =>{
    let previousLevel;
    if(packLevelType.indexOf(levelType) === -1){
        return null
    }else if(packLevelType.indexOf(levelType) === 0){
        return null
    }else{
        previousLevel = packLevelType.indexOf(levelType) - 1 ;
    }
   let result = await PackModel.findOne({"level.levelType": packLevelType[previousLevel] }).select('advantages').lean().exec();
    return result;
};

const getAllPacks = async (perPage, page) => {
    let result = await PackModel.find({}).sort({"price": 1}).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    return result;
};

const updatePack = async (id, pack) => {
    let result;
    const currentPack = await PackModel.findById(id).exec();
    if (currentPack) {
        currentPack.set(pack);
        result = await currentPack.save();
        return result;
    } else {
        return null;
    }
};

const getPackLevelType = async (id) => {
    let pack = await PackModel.findById(id).select('level').lean().exec();
    return pack;
};

const getPack = async (id) => {
    let pack = await PackModel.findById(id).lean().exec();
    return pack;
};

const deletePack = async (id) => {
    let result = await PackModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

const getPremiumAdvantages =  async() =>{
    let result = await PackModel.findOne({"level.levelType": packLevelType[packLevelType.length-1] }).select('advantages').lean().exec();
    return result;
};

module.exports = {
    deletePack: deletePack,
    getPack: getPack,
    updatePack: updatePack,
    getAllPacks: getAllPacks,
    createPack: createPack,
    getPackLevelType: getPackLevelType,
    getPreviousPackLevel: getPreviousPackLevel,
    getPremiumAdvantages: getPremiumAdvantages
};
