const ExperienceModel = require('../configs/models/experience');
const preprocessing = require('../common/utils/cleanDescription');

const createExperience = async (experience) => {
    // clean the description
    if (experience.description) {
        experience.description = preprocessing.removePhoneNumber(experience.description, " ");
    }
    const newExperience = new ExperienceModel(experience);
    let result = await newExperience.save();
    return result;
};

const getAllExperiences = async (perPage, page, filterParams, pagination = true) => {
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    delete filterParams.viewAs;

    filterParams["isVisible"] = true;

    if (filterParams.tags) {
        filterParams.tags = {"$in": filterParams.tags}
    }

    for (let [key, value] of Object.entries(filterParams)) {
        if (typeof value == "string") {
            if ((new Date(value)).toString() === "Invalid Date" && key !== "employee") {
                filterParams[key] = new RegExp(value + ".*", "i")

            }
        }
    }
    let result = !pagination ? await ExperienceModel.find(filterParams).select('-__v').lean().exec()
        : await ExperienceModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    let length = await ExperienceModel.find(filterParams).countDocuments();

    return {"experiences": result, "length": length};
};

const updateExperience = async (id, experience) => {
    let result;
    let currentExperience;
    currentExperience = await ExperienceModel.findById(id).exec();
    if (currentExperience) {
        currentExperience.set(experience);
        result = await currentExperience.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
    }
    console.log('update service experience by id : ' + id);
    return result;
};

const getExperience = async (id) => {
    let experience = await ExperienceModel.findById(id).select('-__v').lean().exec();
    console.log('get experience service with id  ' + id);
    return experience;
};

const getExperienceByEmployee = async (employee) => {
    let experiences = await ExperienceModel.find({employee: employee}).select('-__v').lean().exec();
    console.log('get experience service with by employee  ' + employee);
    return experiences;
};

const deleteExperience = async (id) => {
    let result;
    result = await ExperienceModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;

};

const cancelExperience = async (id) => {
    let result;
    let currentExperience;
    currentExperience = await ExperienceModel.findById(id).exec();
    if (currentExperience) {
        currentExperience.set({"isVisible": false});
        result = await currentExperience.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
    }
    return result;
};


module.exports = {
    getAllExperiences: getAllExperiences,
    createExperience: createExperience,
    deleteExperience: deleteExperience,
    cancelExperience: cancelExperience,
    updateExperience: updateExperience,
    getExperience: getExperience
};
