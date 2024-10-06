const ApplicationModel = require('../configs/models/application');
const particularService = require('../services/particular');
const processing = require('../common/utils/processing');
const formatFilterParams = require('../common/utils/processing').formatFilterParams;

const createApplication = async (application) => {
    console.log('create application service was called ');
    application.applicationDate = Date.now();
    const newApplication = new ApplicationModel(application);
    let result = await newApplication.save();
    return {id: result._id, cv: result.cv, portfolio: result.portfolio, identityCard: result.identity_card,
            driverPermit: result.driver_permit, schoolLevel: result.school_level, motivations: result.motivations};
};


const getAllApplications = async (perPage, page, filterParams,  level = 1, pagination = true) => {
    let result;
    let populateCollection =    [{
            path: 'job',
            select: 'title price town street  _id slug'
        },{
        path: 'employee',
        select: ' _id  surname name town '
    }]
    console.log('get all applications service');
    delete filterParams.requestType;
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    delete filterParams.level;
    if(filterParams.slug){
        const job = await JobModel.find({"slug":filterParams.slug}).exec();
        delete filterParams.slug;
        // TO DO ADD TEST
        filterParams["job"]= job[0]["_id"]
    }

        // list of objectd fields
        let objectIdlist = ["employee", "job","state"];
        // list of objectd fields
        filterParams = formatFilterParams(filterParams, objectIdlist);
        // Join
        if(Number(level) === 0){
            filterParams.state = {$ne: "validated"};
        } 
        let length = await ApplicationModel.find(filterParams).countDocuments();
        result = await ApplicationModel.find(filterParams)
        .populate(populateCollection)
        .sort({"applicationDate": -1})
        .limit(perPage)
        .skip(perPage * page)
        .select('-__v ')
        .lean()
        .exec();

        result = {"applications": result, "length": length};
        return result;
};

const getNbApplicationByJob = async (idJob) => {
    let nbApplications = await ApplicationModel.find({"job": idJob}).countDocuments();
    return nbApplications;
};

const getNbApplicationByEmployee = async (idEmployee) => {
    let nbApplications = await ApplicationModel.find({
        "employee": idEmployee,
        "state": {$ne : "cancelled"}
    }).countDocuments();
    return nbApplications;
};

const updateApplication = async (id, application) => {
    let currentApplication;
    application.updateAt = Date.now();
    console.log('call update Application service by id : ' + id);
    currentApplication = await ApplicationModel.findByIdAndUpdate(id,
        processing.dotNotate(application),
        {
            new: true,
            useFindAndModify: false
        }).select('-_id -__v').exec();
    return currentApplication;
};

const getApplication = async (id) => {
    let currentApplication;
    console.log('call get application by id : ' + id);
    currentApplication = await ApplicationModel.findById(id).populate({
        path: 'job',
        select: '-employer -__v'
    }).select('-__v -_id -updateAt').lean().exec();
    return currentApplication;
};

const getApplicationByEmployeeAndJob = async (employee, job) => {
    let currentApplication;
    console.log('call get application by employee and job');
    currentApplication = await ApplicationModel.findOne({
        "employee": employee,
        "job": job,
        "state": {$ne : "validated"}
    }).select('-__v  -updateAt').lean().exec();
    return currentApplication;
};

const addApplicatonFile =  async( user, application) => {
        
    let filesColums = {"cv":"cv.url","identity_card":"identity_card.url", "driver_permit":"driver_permit.url", "school_level":"school_level.url"};
    filesTypeColums = {"identity_card":"identityCard" ,"school_level":"schoolLevel"}

    console.log("before ");
    console.log(user);

    for (const [file, url] of Object.entries(filesColums)) {
        
        currentFileType = filesTypeColums.hasOwnProperty(file) ? filesTypeColums[file] : file

         console.log("before"+url);
         
         console.log(application);
         
         if(application[file] && application[file].url){
             user[currentFileType].url =application[file].url;
         }
         
       }
    console.log("after ");
    console.log(user);
    return user;   
 };
const getCandidateFromApplicationId = async (id, user) => {
    let particular;
    console.log('call get candidate service by id : ' + id + 'by user : ' + user);
    const currentApplication = await ApplicationModel.findById(id)
        .lean().exec();
    particular = currentApplication ? (currentApplication.state === 'validated' ?
        await particularService.getParticularWhenAcquitted("id", currentApplication.employee) :
        await particularService.getParticularAnonymous("id", currentApplication.employee)) : null;
    
    particular = await addApplicatonFile( particular, currentApplication)
    return particular;
};

const getValidatedJobsApplications = async (idJob) => {
    let result;
    result = await ApplicationModel.find({
        job: idJob,
        state: 'validated'
    }).populate(
        {
            path: 'employee',
            select: '-valid -state -password -MoneyAccount -emailUsed -registrationDate -referenceStreet  -updateAt -validationToken -__v'
        }
    ).select('employee job employer motivations identity_card cv driver_permit').lean().exec();
    // we Add amount
    console.log('get all validated employees for the job : ' + idJob);
    return result;
};

const getValidatedJobsApplicationsByEmployee = async (idUser) => {
    let jobs = await ApplicationModel.find({
        employee: idUser,
        state: 'validated'
    }).populate(
        {
            path: 'job',
            select: 'title town street startDate endDate employer frequency tags typeEmployer state price isPriceDefined'
        }
    ).select('employee job employer').lean().exec();
    // we Add amount
    console.log('get all validated applications for the user : ' + idUser);
    return jobs;
};

const addFilefromUserProfil = async (ownerId, slug) => {

    console.log('add file to application   from user  : ' + ownerId+" on job "+slug);
    const job = await JobModel.find({"slug":slug}).exec();
    const application = await ApplicationModel.find({'job': job[0].id, employee:ownerId}).exec();
    const particularFromApplication = await particularService.getParticular("id", ownerId);
    currentApplication = await ApplicationModel.findByIdAndUpdate(application._id,
        {
            "cv.url":particularFromApplication.cv.url,
            "identity_card.url":particularFromApplication.identityCard.url,
            "driver_permit.url":particularFromApplication.driver_permit.url,
            "degree.url":particularFromApplication.schoolLevel.url         
        }).select('-_id -__v').exec();

    return currentApplication;
};

const deleteApplication = async (id) => {
    let result;
    console.log('delete application service id : ' + id);
    result = await ApplicationModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};


module.exports = {
    createApplication: createApplication,
    getApplication: getApplication,
    updateApplication: updateApplication,
    getAllApplications: getAllApplications,
    getCandidateFromApplicationId: getCandidateFromApplicationId,
    getValidatedJobsApplications: getValidatedJobsApplications,
    addFilefromUserProfil: addFilefromUserProfil,
    deleteApplication: deleteApplication,
    getApplicationByEmployeeAndJob: getApplicationByEmployeeAndJob,
    getNbApplicationByJob: getNbApplicationByJob,
    getValidatedJobsApplicationsByEmployee: getValidatedJobsApplicationsByEmployee,
    getNbApplicationByEmployee: getNbApplicationByEmployee
};
