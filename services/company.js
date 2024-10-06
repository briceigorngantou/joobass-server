// TODO
const CompanyModel = require('../configs/models/company');
const formatFilterParams = require('../common/utils/processing').formatFilterParams;
const RoleModel = require('../configs/models/role');

const createCompany = async (entreprise) => {
    console.log("company service creation");
    const newEntreprise = new CompanyModel(entreprise);
    let result = await newEntreprise.save();
    return result;
};

const getAllCompanies = async (perPage, page, filterParams, pagination = true) => {
    // delete the not used filterParams
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    filterParams = formatFilterParams(filterParams,[]);
    if (filterParams.tags) {
        filterParams.tags = {"$in": filterParams.tags}
    }

    if(filterParams.phoneNumber){
        filterParams['phoneNumber.value'] = parseInt(filterParams.phoneNumber) ;
        delete filterParams.phoneNumber;
    }

    let length = await CompanyModel.find(filterParams).count();
    //we  handle pagination
    let result = pagination ? await CompanyModel.find(filterParams).limit(perPage).skip(perPage * page).select('-__v').lean().exec()
        : await CompanyModel.find(filterParams).select('-__v').lean().exec();
    return {"companies": result, "length": length};
};

const updateCompany = async (id, company) => {
    let result;
    console.log('call update company service id :' + id);
    const currentCompany = await CompanyModel.findById(id).exec();
    if (currentCompany) {
        currentCompany.set(company);
        result = await currentCompany.save();
        result.toJSON();
        delete result._id;
        delete result.__v;
    }
    return result;
};

const getCompany = async (field, value) => {
    let company;
    if (field === 'email') {
        company = await CompanyModel.findOne({"email.value": value}).
        select('-__v ').lean().exec();
    } else if (field === 'phoneNumber') {
        company = await CompanyModel.findOne({"phoneNumberCompany.value": value}).
        select('-__v ').lean().exec();
    } else if (field === 'affiliation') {
        company = await  CompanyModel.findOne({"affiliation.code": value}).select('-__v ').lean().exec();
    }
     else if (field === "random_code_for_processes") {
        company = await CompanyModel.findOne({"random_code_for_processes.requestId": value}).
        select('-__v ').lean().exec();
    }else {
        company = await CompanyModel.findById(value).select('-__v -password').lean().exec();
    }
    console.log('get company service by  field : ' + field + ' and value :' + value);
    return company;
};

const getCompanyPhoneNumber = async (id) => {
    let company = await CompanyModel.findById(id).select('phoneNumber').lean().exec();
    return company.phoneNumber.value;
};

const deleteCompany = async (id) => {
    let result = await CompanyModel.deleteOne({_id: id}).exec();
    if (result.deletedCount > 0) {
        const resultRole = await RoleModel.deleteMany({'userId': id}).exec();
        return resultRole.deletedCount > 0;
    } else {
        return false;
    }
};

const getCompanyInitial = async (id)=>{
    let company = await CompanyModel.findById(id).select('nameCompany').lean().exec();
    return company.nameCompany[0]+".";
};

const getCompanyName = async(id)=>{
    let company = await CompanyModel.findById(id).select('nameCompany').lean().exec();
    return company.nameCompany;
};

const getLogoUrl = async(id)=>{
    let company = await CompanyModel.findById(id).select('imageUrl').lean().exec();
    return company.imageUrl ? company.imageUrl.url : null;
};

module.exports = {
    getAllCompanies: getAllCompanies,
    createCompany: createCompany,
    deleteCompany: deleteCompany,
    updateCompany: updateCompany,
    getCompany: getCompany,
    getLogoUrl: getLogoUrl,
    getCompanyPhoneNumber:getCompanyPhoneNumber,
    getCompanyInitial: getCompanyInitial,
    getCompanyName: getCompanyName
};
