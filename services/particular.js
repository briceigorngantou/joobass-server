const ParticularModel = require('../configs/models/particular');
const RoleModel = require('../configs/models/role');
const employeeStatModel = require('../configs/models/statsEmployee');
const employerStatModel = require('../configs/models/statsEmployer');
const EvaluationModel = require('../configs/models/evaluation');
const preprocessing = require('../common/utils/cleanDescription');
const formatFilterParams = require('../common/utils/processing').formatFilterParams;

const createParticular = async (particular) => {
    // clean the description
    particular.name = particular.name.replace("'", "");
    const newParticular = new ParticularModel(particular);
    let result = await newParticular.save();
    return result;
};

const getAllParticulars = async (perPage, page, filterParams, pagination = true) => {
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    filterParams = formatFilterParams(filterParams,["phoneNumber.value"]);
    if(filterParams.tags){
        filterParams.tags= { "$in" :filterParams.tags}
    }
    if(filterParams.phoneNumber){
        filterParams['phoneNumber.value'] = parseInt(filterParams.phoneNumber) ;
        console.log("phoneNumber "+filterParams.phoneNumber) ;
        delete filterParams.phoneNumber;
    }
   
    let result = !pagination ? await ParticularModel.find(filterParams).select('-__v').lean().exec()
        : await ParticularModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    let length = await ParticularModel.find(filterParams).countDocuments();
    return {"particulars": result, "length": length};
};

const updateParticular = async (id, particular, state = 1) => {
    let result;
        let currentParticular;

        if(state === 0){
            currentParticular = await ParticularModel.findOne({'email.value': id}).exec();
            if(currentParticular && !currentParticular.valid){
                currentParticular = null;
            }
        }else{
            currentParticular = await ParticularModel.findById(id).exec();
        }
    if (currentParticular) {
        console.log(particular);
        currentParticular.set(particular);
        result = await currentParticular.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
        delete result.password;
        }
        console.log('update service particular by id : ' + id);
    return result;
};

const getParticular = async (field, value) => {
    let particular;
    if (field === 'email') {
        particular = await ParticularModel.findOne({"email.value": value}).select('-__v').lean().exec();
    } else if (field === 'phoneNumber') {
        particular = await ParticularModel.findOne({"phoneNumber.value": value}).select('-__v').lean().exec();
    } else if (field === 'affiliation') {
        particular = await ParticularModel.findOne({"affiliation.code": value}).select('-__v').lean().exec();
    } else if (field === "random_code_for_processes") {
        particular = await ParticularModel.findOne({"random_code_for_processes.requestId": value}).select('-__v').lean().exec();
    } else {
        particular = await ParticularModel.findById(value).select('-__v').lean().exec();
    }
    console.log('get particular service by  field : ' + field + ' and value :' + value);
    return particular;
};

const getParticularInitial =  async  (id) =>{
    console.log("Get particular Initial service by id : " + id);
    let particular = await ParticularModel.findById(id).select('initial').lean().exec();
    return particular.initial;
};

const getParticularPhoneNumber = async (id) => {
    let particular = await ParticularModel.findById(id).select('phoneNumber').lean().exec();
    return particular.phoneNumber.value;
};

const getParticularAnonymous = async (field, value,) => {
    let particular;
    particular = field === 'email' ? await ParticularModel.findOne({'email.value': value}).select('-phoneNumber -__v  -MoneyAccount  -valid -state -password -validationToken').exec()
            : await ParticularModel.findById(value).select('-phoneNumber -MoneyAccount -valid  -state -password -validationToken -__v').lean().exec();
        if (particular) {
            // compute age
            const diff_ms = Date.now() - particular.birthday.getTime();
            const age_dt = new Date(diff_ms);
            particular.age = Math.abs(age_dt.getUTCFullYear() - 1970);
            delete particular.birthday;
        }
        return particular;
};

const getParticularWhenAcquitted = async (field, value) => {
    let particular;
    particular = field === 'email' ? await ParticularModel.findOne({'email.value': value}).select(' -valid -birthday -state -password -validationToken -__v -phoneNumber.requestId').exec()
        : await ParticularModel.findById(value).select(' -valid  -state -password -validationToken -__v -phoneNumber.requestId').exec();
    if (particular) {
        particular = particular.toJSON();
        const diff_ms = Date.now() - particular.birthday.getTime();
        const age_dt = new Date(diff_ms);
        particular.age = Math.abs(age_dt.getUTCFullYear() - 1970);
        delete particular.birthday
    }
    return particular;
};


const getBestJober = async (filterParams, endDate = new Date(), durationInDays = 30) => {
    /* this function returns the best jober base on evaluation  during a month of observation starting from the date given date
    */
    //TODO change this startDate the 1st of the current month end date the n-1 of the current month
    //TODO pagination
    //TODO TRANSFORM EVALUATION.aggregate to external service in evaluation
    //check startDate type and cast in Date if it 's a string

    if (!(typeof endDate !== "object")) {
        endDate = new Date(endDate)
   }
    //we compute the startDate base on the endDate
    let startDate = new Date(endDate.getTime());
    startDate.setDate(startDate.getDate() - durationInDays);
    try {

        const bestJobers = await getBestJobers(filterParams, endDate, durationInDays);

        const bestJober = bestJobers.bestJobers.filter(jober => jober._id == filterParams.id);
        return {bestJober: bestJober};
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

const getBestJobers = async (filterParams, endDate = new Date(), durationInDays = 30) => {
    /* this function returns the best jober base on evaluation  during a month of observation starting from the date given date
    */
    //TODO change this startDate the 1st of the current month end date the n-1 of the current month
    //TODO pagination
    //TODO TRANSFORM EVALUATION.aggregate to external service in evaluation
    //check startDate type and cast in Date if it 's a string
    if (!(typeof endDate !== "object")) {
        endDate = new Date(endDate)
    }
    //we compute the startDate base on the endDate
    let startDate = new Date(endDate.getTime());
    startDate.setDate(startDate.getDate() - durationInDays);
    let rank;
    try {
        const filter = [
            {"evaluationDate": {"$gte": startDate}},
            {"evaluationDate": {"$lte": endDate}},
            {"typeEvaluation": "employee"}];

        const aggregatorOpts = [
            {
                $lookup:
                    {
                        from: "particulars",
                        localField: "evaluated",
                        foreignField: "_id",
                        as: "particulars_info"
                    }
            },
            {$match: {$and: filter}},
            {
                $group: {
                    _id: "$evaluated",
                    mean_grade: {$avg: "$grade"},
                    sum_grade: {$sum: "$grade"},
                    nbEvaluations: { $sum: 1 },
                    particulars_info: {$first: "$particulars_info"}
                }
            }, {
                $sort: {mean_grade: -1}
            },
        ];
        let bestJobers = await EvaluationModel.aggregate(aggregatorOpts).exec();
        //  const jober = await ParticularModel.findById(Bestjober[0]._id).lean().exec();
        // jober.toJSON(); //TODO NECESSARY ?
        rank = 1;
        bestJobers.forEach(jober => {
            jober.rank = rank;
            jober.town = jober.particulars_info[0].town;
            jober.street = jober.particulars_info[0].street;
            jober.initial = jober.particulars_info[0].initial;
            delete jober.particulars_info;
            rank++;
        });
        return {length: bestJobers.length, bestJobers: bestJobers};
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

const getEmployeesWithStats = async () => {

// This function retuns all the particular with state employee sort by nbSMS
try {
    const filter = [
        {"valid": true},
        {"state":"employee"},
        {"isNotified": true},
    ];

    const aggregatorOpts = [
        {
            $lookup:
                {
                    from: "employeestats",
                    localField: "_id",
                    foreignField: "userId",
                    as: "statsEmployee"
                }
        },
        {$match: {$and: filter}}
       ,{$sort:{"statsEmployee.nbSms":1}}
    ];
    const particulars = await ParticularModel.aggregate(aggregatorOpts).exec();
    console.log("taille est "+ particulars.length)
    return {length: particulars.length, particulars: particulars};
} catch (e) {
    console.log(e.message);
    return null;
}

}

const deleteParticular = async (id) => {
    let result;
    const user = await ParticularModel.findById(id).select('state -_id').exec();
    const userState = user.state;
    let resultSat;
    if (userState) {
        for (let i = 0; i < userState.length; i++) {
            if (userState[i] === 'employee') {
                resultSat = employeeStatModel.deleteMany({'userId': id}).exec();
            }
            if (userState[i] === 'employer') {
                resultSat = employerStatModel.deleteMany({'userId': id}).exec();
            }
        }
    }
    if (resultSat) {
        const resultRole = await RoleModel.deleteMany({'userId': id}).exec();
        if (resultRole) {
            result = await ParticularModel.deleteOne({'_id': id}).exec();
            return result.deletedCount > 0;
        } else {
            return false;
        }
    }
};

const updateRoleByUser = async (userId, Role) => {
    let result;
    const currentUser = await ParticularModel.findOne({'_id': userId}).exec();
    console.log("user "+currentUser.state) ;
    let roles = currentUser.state;
    if (!roles.includes(Role)) {
        roles.push(Role);
    }
    if (currentUser) {
        currentUser.set({'state': roles});
        result = await currentUser.save();
        return result;
    } else {
        return null;
    }
};

const searchParticularByName = async (name) => {
    let result;
    let output = [];
    let query = [{"name": new RegExp(".*" + name + ".*", "i")},
        {"surname": new RegExp(".*" + name + ".*", "i")}];
    result = await ParticularModel.find().or(query).limit(6).sort('name').select('_id name surname state').lean().exec();
    if (result && result.length && result.length > 0) {
        result.forEach(user => {
            let obj = {
                id: user._id,
                label: user.name + ' ' + user.surname,
                state: user.state
            };
            output.push(obj);
        });
    }
    return output;
};


module.exports = {
    getAllParticulars: getAllParticulars,
    createParticular: createParticular,
    deleteParticular: deleteParticular,
    updateParticular: updateParticular,
    getParticular: getParticular,
    getParticularAnonymous: getParticularAnonymous,
    getParticularWhenAcquitted: getParticularWhenAcquitted,
    getEmployeesWithStats:getEmployeesWithStats,
    updateRoleByUser: updateRoleByUser,
    getBestJobers: getBestJobers,
    getBestJober: getBestJober,
    getParticularPhoneNumber: getParticularPhoneNumber,
    searchParticularByName: searchParticularByName,
    getParticularInitial: getParticularInitial
};
