const prospectModel = require('../configs/models/prospect');

const createProspect = async (prospect) => {
    prospect.name = prospect.name.replace("'", "");
    const newProspect = new prospectModel(prospect);
    let result = await newProspect.save();
    return {id: result._id};
};

const getAllProspects = async () => {
    let result = await prospectModel.find({}).select('-__v').lean().exec();
    let length = await prospectModel.find({}).countDocuments();
    return {"prospects": result, "length": length};
};

const getProspect = async (field, value) => {
    let prospect;
    if (field === 'email') {
        prospect = await prospectModel.findOne({"email": value}).select('-__v').lean().exec();
    } else if (field === 'phoneNumber') {
        particular = await prospectModel.findOne({"phoneNumber": value}).select('-__v').lean().exec();
    } else {
        particular = await prospectModel.findById(value).select('-__v').lean().exec();
    }
    console.log('get prospect service by  field : ' + field + ' and value :' + value);
    return particular;
};



module.exports = {
    getAllProspects: getAllProspects,
    createProspect: createProspect
};

