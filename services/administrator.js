const AdministratorModel = require('../configs/models/administrator');
const RoleModel = require('../configs/models/role');

const createAdministrator = async (administrator) => {
    const newAdministrator = new AdministratorModel(administrator);
    let result;
    result = await newAdministrator.save();
    return result;
};

const getAllAdministrators = async (perPage, page, filterParams, pagination = true) => {
    let result;
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;

    if (filterParams.tags) {
        filterParams.tags = {"$in": filterParams.tags}
    }
    for (let [key, value] of Object.entries(filterParams)) {
        if (typeof value == "string") {
            if ((new Date(value)).toString() === "Invalid Date") {
                filterParams[key] = new RegExp(value + ".*", "i")
            }
        }
    }
    let length = await AdministratorModel.find(filterParams).count();
    //we  handle pagination
    if (pagination === true) {
        result = await AdministratorModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    } else {
        result = await AdministratorModel.find(filterParams).select('-__v').lean().exec();
    }
    return {"administrators": result, "length": length};
};

const updateAdministrator = async (id, administrator, state = 1) => {
    let result;
        let currentAdministrator;
        if (state === 0) {
            currentAdministrator = await AdministratorModel.findOne({'email.value': id}).exec();
            if (currentAdministrator && !currentAdministrator.valid) {
                currentAdministrator = null;
            }
        } else {
            currentAdministrator = await AdministratorModel.findById(id).exec();
        }
    if (currentAdministrator) {
        console.log(administrator);
        currentAdministrator.set(administrator);
        // console.log(currentAdministrator);
        result = await currentAdministrator.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
        }
        console.log('update service administrator by id : ' + id);
    return result;
};

const getAdministrator = async (field, value) => {
    let administrator;
    // administrator = field === 'email' ? await AdministratorModel.findOne({'email.value': value}).select('-__v').lean().exec() : await AdministratorModel.findById(value).select('-id -password -__v').lean().exec();
    if (field === 'email') {
        administrator = await AdministratorModel.findOne({"email.value": value}).select('-__v').lean().exec();
    } else if (field === 'phoneNumber') {
        administrator = await AdministratorModel.findOne({"phoneNumber.value": value}).select('-__v').lean().exec();
    } else if (field === "random_code_for_processes") {
        administrator = await AdministratorModel.findOne({"random_code_for_processes.requestId": value}).select('-__v').lean().exec();
    } else{
        administrator = await AdministratorModel.findById(value).select('-__v').lean().exec();
    }
    console.log('get administrator service by  field : ' + field + ' and value :' + value);
    return administrator;
};

const deleteAdministrator = async (id) => {
    console.log('delete administration service id : ' + id);
    let result;
    const resultRole = await RoleModel.deleteOne({'userId': id}).exec();
    if (resultRole) {
        result = await AdministratorModel.deleteOne({'_id': id}).exec();
        return result.deletedCount > 0;
    } else {
        return false;
    }
};


module.exports = {
    getAllAdministrators: getAllAdministrators,
    createAdministrator: createAdministrator,
    deleteAdministrator: deleteAdministrator,
    updateAdministrator: updateAdministrator,
    getAdministrator: getAdministrator
};
