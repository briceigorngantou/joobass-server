const humanResourcesModel = require('../configs/models/collaborator');

const createHumanResource = async (collaborator) => {
    const newHumanResource = new humanResourcesModel(collaborator);
    let result;
    result = await newHumanResource.save();
    return result;
};

const getAllHumanResource = async (perPage, page, filterParams, pagination = true) => {
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
    let length = await humanResourcesModel.find(filterParams).count();
    //we  handle pagination
    if (pagination === true) {
        result = await humanResourcesModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    } else {
        result = await humanResourcesModel.find(filterParams).select('-__v').lean().exec();
    }
    return {"collaborators": result, "length": length};
};

const updateHumanResource = async (id, collaborator) => {
    let result;
    let currentHumanResource;
    currentHumanResource = await humanResourcesModel.findById(id).exec();
    if (currentHumanResource) {
        currentHumanResource.set(collaborator);
        // console.log(currentAdministrator);
        result = await currentHumanResource.save();
        result.toJSON();
        delete result._id;
        }
        console.log('update service collaborator by id : ' + id);
    return result;
};

const getHumanResource = async (field, value) => {
    let collaborator;
    if (field === 'email') {
        collaborator = await humanResourcesModel.findOne({"email.value": value}).select('-__v').lean().exec();
    } else if (field === 'phoneNumber') {
        collaborator = await humanResourcesModel.findOne({"phoneNumber.value": value}).select('-__v').lean().exec();
    } else{
        collaborator = await humanResourcesModel.findById(value).select('-__v').lean().exec();
    }
    console.log('get collaborator service by  field : ' + field + ' and value :' + value);
    return collaborator;
};

const deleteHumanResource = async (id) => {
    console.log('delete collaborator service id : ' + id);
    let result;
    result = await humanResourcesModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};


module.exports = {
    getAllHumanResource: getAllHumanResource,
    createHumanResource: createHumanResource,
    deleteHumanResource: deleteHumanResource,
    updateHumanResource: updateHumanResource,
    getHumanResource: getHumanResource
};
