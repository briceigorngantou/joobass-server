const JobModel = require('../configs/models/job');
const particularService = require('../services/particular');
const StatsEmployerService = require('../services/statsEmployer');
const applicationService = require('../services/application');
const companyService = require('../services/company');

const createJob = async (job) => {
    console.log("create job service");
    let result;
    const newJob = new JobModel(job);
    result = await newJob.save();
    return {id: result._id, title: result.title, slug: result.slug, employerPayment:result.employerPayment, tags: result.tags};
};


const getAllJobs = async (perPage, page, filterParams, level, pagination = true, preview, fieldList=[]) => {
    if(fieldList.length > 0){
        fieldList = fieldList.join(' ');
    }
    let result;
    let jobForAll;
    let length;
    let defaultFieldList = '-__v -chooseCandidate -updateAt -state -description -referenceStreet -nbViews -Views -tags -feesPaid -cv_required -prerequisites -geo_coordinates';
    let fullFieldList = '-__v  -updateAt'
    let previewFieldList = '_id title contractType town street isPriceVisible employer startDate endDate slug price isValid';
    let finalFieldList = '';
    console.log('call get all jobs service');
    // check the sort parameter
    let sortParams = filterParams.sort ? JSON.parse(filterParams.sort) : {"registrationDate": -1};
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.fieldList;
    delete filterParams.page;
    delete filterParams.sort;
    delete filterParams.lang;
    delete filterParams.preview;
    delete filterParams.level;

    if (filterParams.tags && filterParams.tags.length !== 0) {
        filterParams.tags = {$in: filterParams.tags};
    }

    if (filterParams.startDate instanceof Date || filterParams.startDate instanceof String) {
        filterParams.startDate = {$gte: filterParams.startDate};
    }

    if (filterParams.priceMin && filterParams.priceMax) {
        filterParams.price = {$gte: Number(filterParams.priceMin), $lte: Number(filterParams.priceMax)};
        delete filterParams.priceMin;
        delete filterParams.priceMax;
    }

    if(level === 0){
        filterParams.state ={$nin: ["created", "cancelled"]};
    }

    if (filterParams.typeFilter === "raw") {
        filterParams = [{"title": new RegExp(".*" + filterParams.keyword + ".*", "i")}, {"description": new RegExp(".*" + filterParams.keyword + ".*", "i")}];
        length = await JobModel.find().or(filterParams).countDocuments();
        finalFieldList = fieldList !== '' ? fieldList : preview === true ? previewFieldList : defaultFieldList;
        //we  handle pagination
        result =  preview === true ?
            await JobModel.find()
                .or(filterParams)
                .limit(perPage)
                .skip(perPage * page)
                .sort('-registrationDate').
            select(finalFieldList).lean().exec()  :
            await JobModel.find()
                .or(filterParams)
                .limit(perPage)
                .skip(perPage * page).sort('-registrationDate')
                .select(finalFieldList).lean().exec();
        result = {"jobs": result, "length": length}
    } else {
        for (let [key, value] of Object.entries(filterParams)) {
            if (typeof value == "string" && key !== "employer") {
                if ((new Date(value)).toString() === "Invalid Date") {
                    filterParams[key] = new RegExp(value + ".*", "i");
                }
            } else {
                if (value !== undefined && value !== "") {
                    filterParams[key] = value
                } else {
                    delete filterParams[key];
                }
            }
        }
        length = await JobModel.find(filterParams).countDocuments();
        if(preview === "true"){
            jobForAll = await JobModel.find(filterParams)
                .sort(sortParams)
                .limit(perPage)
                .skip(perPage * page)
                .select(previewFieldList).lean().exec();
        }
        finalFieldList = fieldList!== '' ? fieldList :
            level === 0 ? preview === true ? previewFieldList : defaultFieldList : fullFieldList;
        //we  handle pagination
        result = level === 0 ? preview === "true" ? jobForAll :
                await JobModel
                .find(filterParams)
                .sort(sortParams)
                .limit(perPage)
                .skip(perPage * page)
                    .select(finalFieldList).lean().exec() :
            await JobModel
                .find(filterParams)
                .sort(sortParams)
                .limit(perPage)
                .skip(perPage * page)
                .select(finalFieldList).lean().exec();
        result = {"jobs": result, "length": length};
    }
    return result;
};

const getJobPaymentState = async(idJob) => {
    const job = await JobModel.findById(idJob).select('feesPaid').lean().exec();
    return job.feesPaid;
};


const updateJob = async (id, job) => {
    let result;
    console.log('call update job service id :' + id);
    const currentJob = await JobModel.findById(id).exec();
    if (currentJob) {
        if (job.nbplaces !== undefined) {
            console.log("Nb places in the request ");
            job.nbPlacesLeft = currentJob.nbPlacesLeft + (job.nbplaces - currentJob.nbplaces);
            if (job.nbPlacesLeft > 0) {
                job.isValid = true;
            }
            if (job.nbPlacesLeft < 0) {
                throw new Error("Nb places cannot be negative");
            }
        }
        currentJob.set(job);
        result = await currentJob.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
    }
    return result;
};
const updateJobViews = async (id, view) => {
    let result;
    console.log('call update job service id :' + id);
     result= await JobModel.findOneAndUpdate(
         {_id: id},
         {
             $addToSet: {
                 Views: view
             }
         });
        result.toJSON();
        delete result._id;
        delete result.__v;
    return result;
};


const updateJobsEmployer = async (employerId, employerMail) => {
    let result;
    //TO DO ADD type employer as 
    //Ne pas modifier les offre qui sont déjà affecté à un utilisateur existant joué sur le champ type du job 
    
    console.log('call updateJobsEmployere id : employerId' + employerId, employerMail);
    const updatedJob = await JobModel.updateMany({"externalContactsJobOffer.emails":{"$in":[employerMail]},"externalContactsJobOffer.isEmployerRegistered":false} , {employer:employerId, "externalContactsJobOffer.isEmployerRegistered":true});

    let statEmployer = await StatsEmployerService.getStatsByUser(employerId);

    //updated Employer Stat
    if (statEmployer) {
        await StatsEmployerService.updateStatsEmployer(employerId, {nbJobCreated: statEmployer.nbJobCreated + updatedJob['modifiedCount']});
    }
    result = {"nbJobAffected":updatedJob['modifiedCount']}
    return result;
};

const getJob = async (id) => {
    console.log('call service get Job by id : ' + id);
    let currentJob = await JobModel.findById(id)
        .select(' -__v')
        .lean()
        .exec();
    return currentJob;
};

const getJobBySlug = async (slugOfJob) => {
    console.log('call service get Job by slug : ' + slugOfJob);
    let currentJob = await JobModel.findOne({slug: slugOfJob})
        .select(' -__v -reason')
        .lean()
        .exec();
    return currentJob;
};

const getJobBySlugForSEO = async (slugOfJob) => {
    console.log('call service get Job by slug : ' + slugOfJob);
    let currentJob = await JobModel.findOne({slug: slugOfJob})
        .select('description title tags registrationDate updateAt')
        .lean()
        .exec();
    return currentJob;
};

const getEmployerName = async (id) => {
    console.log('call service get employer name by id : ' + id);
    const currentJob = await JobModel.findById(id).select('typeEmployer employer').lean().exec();
    let name = null;
    let meanRating = null;
    let logoUrl = null;
    if (currentJob) {
        console.log('there is current job in getEmployerName');
        if (currentJob.typeEmployer === 'particular') {
            name = await particularService.getParticularInitial(currentJob.employer);
        } else {
            name = await companyService.getCompanyName(currentJob.employer);
            logoUrl = await companyService.getLogoUrl(currentJob.employer);
        }
        const stats = await StatsEmployerService.getStatsByUser(currentJob.employer);
        meanRating = stats.meanRating;
    }
    return {
        "name": name, 
        "rating": meanRating, 
        "type": currentJob.typeEmployer, 
        "logoUrl": logoUrl
    };
};

const getEmployerDetail = async (id) => {
    console.log('call service get employer name by id : ' + id)
    let employer = await  particularService.getParticular("id", id);
    employer = employer ? employer : await companyService.getCompany("id", id);
    if(!employer){
        return null;
    } 
    
    return {
        "name": employer.name,
        "email": employer.email.value, 
        "phoneNumber": employer.phoneNumber.value,
        "companyName": employer.nameCompany ? employer.nameCompany:"particulier"
    };
};
const deleteJob = async (id) => {
    let result;
    console.log('call service delete job by id : ' + id);
    // Decrement statsEmployer if needed 
    
    result = await JobModel.deleteOne({_id: id}).exec();
    return result.deletedCount > 0;
};

const getHiredEmployees = async (jobId) => {
    let employees = await applicationService.getValidatedJobsApplications(jobId);
    console.log("Looking for the employees of the job : " + jobId);
    return employees;
};

const getAllJobLocation = async()=> {
    let streets = await JobModel.distinct('street', {'nbPlacesLeft': {'$gt': 0}}).lean().exec();
    return streets;
};

const getJobTitle = async(idJob)=>{
    let job = await JobModel.findById(idJob).select('title').lean().exec();
    return job.title;
};

module.exports = {
    deleteJob: deleteJob,
    getJob: getJob,
    updateJob: updateJob,
    updateJobViews: updateJobViews,
    updateJobsEmployer: updateJobsEmployer,
    getAllJobs: getAllJobs,
    createJob: createJob,
    getEmployerName: getEmployerName,
    getEmployerDetail:getEmployerDetail,
    getHiredEmployees: getHiredEmployees,
    getAllJobLocation: getAllJobLocation,
    getJobBySlug: getJobBySlug,
    getJobTitle: getJobTitle,
    getJobBySlugForSEO: getJobBySlugForSEO,
    getJobPaymentState: getJobPaymentState
};
