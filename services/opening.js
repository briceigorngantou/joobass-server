const OpeningModel = require('../configs/models/opening');
const RoleModel = require('../configs/models/role');
const employeeStatModel = require('../configs/models/statsEmployee');
const employerStatModel = require('../configs/models/statsEmployer');
const EvaluationModel = require('../configs/models/evaluation');
const shortid = require('shortid')
const preprocessing = require('../common/utils/cleanDescription');

const createOpening = async (opening) => {

    const  targetUrl = opening.targetUrl ;
    let type,idTarget , targetUser;
    const shortId = shortid.generate() ;

    opening.shortId = shortId ;

    if( targetUrl.includes("/job") ||  targetUrl.includes("jobs") ) {
        opening.targetType = "job"
    } else if ( targetUrl.includes("/evaluation") ) {
        opening.targetType = "evaluation" ;
    }

    const newOpening = new OpeningModel(opening);
    let result = await newOpening.save();
    return result.shortId;
};

const getAllOpenings = async (perPage, page, filterParams, pagination = true) => {
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

    let result = !pagination ? await OpeningModel.find(filterParams).select('-__v').lean().exec()
        : await OpeningModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    let length = await OpeningModel.find(filterParams).countDocuments();
    return {"openings": result, "length": length};
};

const updateOpening = async (id, opening, state = 1) => {
    let result;
        let currentOpening;
        currentOpening = await OpeningModel.findById(id).exec();
        
    if (currentOpening) {
        currentOpening.set(opening);
        result = await currentOpening.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
        }
        console.log('update service Opening by id : ' + id);
    return result;
};

const getOpening = async (id) => {
    let opening;
     opening = await OpeningModel.findOne({shortId:id}).select('-__v').lean().exec();
     //Increment View
     await OpeningModel.findOneAndUpdate( {"shortId":id},{ $inc: { "nbViews" : 1 }, 
        $addToSet: {
            Views: {dateView: new Date()}}
    }) ;
     console.log('get opening  service by  id '+id);
     return opening;
};


const deleteOpening = async (id) => {
    let result;
    result = await OpeningModel.deleteOne({'_id': id}).exec();
    const user = await OpeningModel.findById(id).select('state -_id').exec();
 
            result = await OpeningModel.deleteOne({'_id': id}).exec();
            return result.deletedCount > 0;
    
};



module.exports = {
    getAllOpenings : getAllOpenings,
    createOpening: createOpening,
    deleteOpening: deleteOpening,
    updateOpening: updateOpening,
    getOpening: getOpening
};
