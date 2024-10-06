const EvaluationModel = require('../configs/models/evaluation');
const particularService = require('../services/particular');
const companyService = require('../services/company');
const processing = require('../common/utils/processing');

const createEvaluation = async (evaluation) => {
    console.log('call service create evaluation');
    const newEvaluation = new EvaluationModel(evaluation);
    let result = await newEvaluation.save();
    return {id: result._id};
};

const getAllEvaluations = async (perPage, page, filterParams, anonymous = false) => {
    console.log('service get All evaluations');
    let result;
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    delete filterParams.anonymous;
    const length = await EvaluationModel.find(filterParams).countDocuments();
    // we  handle pagination
    result = await EvaluationModel.find(filterParams).populate({
        path: 'job',
        select: 'title street town employer'
    }).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    result = anonymous === false ? await evaluationsPromised(result) :
        await evaluationsPromised(result, 'initial');
    return {"evaluations": result, "length": length};
};

const evaluationsPromised = async (result, field = 'name') => {
    return Promise.all(result.map(async function (element) {
        let name;
        let nameEvaluated;
        if (element.typeEvaluator === 'particular') {
            const user = await particularService.getParticular('id', element.evaluator);
            name = field === 'name' ? user.name + ' ' + user.surname : user.initial;
        } else {
            const user = await companyService.getCompany('id', element.evaluator);
            name = user.nameCompany;
        }
        // evaluated
        if (element.typeEvaluated === 'particular') {
            const user =  element.evaluated ? await particularService.getParticular('id', element.evaluated): '';
            nameEvaluated = field === 'name' ? user.name + ' ' + user.surname : user.initial;
        } else if(element.evaluated) {
            const user = await companyService.getCompany('id', element.evaluated);
            nameEvaluated = user? user.nameCompany: '';
        }
        return {
            "_id": element._id,
            "evaluator": element.evaluator,
            "grade": element.grade,
            "nameEvaluator": name,
            "nameEvaluated": nameEvaluated,
            "job": element.job,
            "evaluationDate": element.evaluationDate,
            "jobComment": element.jobComment
        }
    }));
};

const updateEvaluation = async (id, evaluation) => {
    console.log('call service update evaluation by id :' + id);
    let currentEvaluation = await EvaluationModel.findByIdAndUpdate(id,
        processing.dotNotate(evaluation),
        {
            new: true,
            useFindAndModify: false
        }).select('-_id -__v').lean().exec();
    return currentEvaluation;
};

const getEvaluation = async (id) => {
    console.log('call service get evaluation by id : ' + id);
    const currentEvaluation = await EvaluationModel.findById(id).select('-_id -__v').lean().exec();
    return currentEvaluation;
};

const getUserEvaluations = async (perPage, page, userId) => {
    console.log('call service get evaluation by id  user: ' + userId);
    const result = await getAllEvaluations(perPage, page, {'evaluated': userId}, true);
    return result;
};

const getEvaluationByJobByUser = async (jobId, userId) => {
    console.log('call service get evaluation by id  user: ' + userId + ' and the job : ' + jobId);
    const length = await EvaluationModel.find({"evaluated": userId, "job": jobId}).countDocuments();
    // we  handle pagination
    let result = await EvaluationModel.find({"evaluated": userId, "job": jobId}).select('-__v').lean().exec();
    return {"evaluations": result, "length": length};
};

const deleteEvaluation = async (id) => {
    let result;
    console.log('call service delete Evaluation by id : ' + id);
    result = await EvaluationModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};


module.exports = {
    deleteEvaluation: deleteEvaluation,
    getEvaluation: getEvaluation,
    getEvaluationByJobByUser: getEvaluationByJobByUser,
    updateEvaluation: updateEvaluation,
    getAllEvaluations: getAllEvaluations,
    createEvaluation: createEvaluation,
    getUserEvaluations: getUserEvaluations
};
