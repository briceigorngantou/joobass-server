const MetafileModel = require('../configs/models/metadatafile');
const formatFilterParams = require('../common/utils/processing').formatFilterParams;
const mongoose = require('mongoose');

const createMetafile = async (metafile) => {
    const newMetafile = new MetafileModel(metafile);
    let result = await newMetafile.save();
    return {id: result._id, fileId: result.fileId};
};

const createMetafileAws = async (metafile) => {
    const newMetafile = new MetafileModel(metafile);
    let result = await newMetafile.save();
    return {id: result._id, bucketKey: result.bucketKey, bucketName: result.bucketName};
};

const getAllMetafiles = async (perPage, page, filterParams, pagination = true) => {
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    delete filterParams.pagination;
    const excludedKeys = ["owner"];
    filterParams = formatFilterParams(filterParams, excludedKeys);
    
    let length = await MetafileModel.find(filterParams).countDocuments();
    let fileTypeList = await MetafileModel.find(filterParams).select('fileType').lean().exec();
    fileTypeList = fileTypeList.map(x => x = x.fileType);
    fileTypeList = [...new Set(fileTypeList)];
    let result;
    if(pagination === true ) {
           result = await MetafileModel.find(filterParams).sort({"createdAt": -1}).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    } else {
        
          result = await MetafileModel.find(filterParams).sort({"createdAt": -1}).select('-__v').lean().exec();
    }
    return {"metadataFiles": result, "length": length, "fileTypeList": fileTypeList};
};

const updateMetafile = async (id, metafile) => {
    let result;
    console.log('call update metafile service id :' + id);
    const currentMetafile = await MetafileModel.findById(id).exec();
    if (currentMetafile) {
        currentMetafile.set(metafile);
        result = await currentMetafile.save();
        result.toJSON();
         result._id;
        delete result.__v;
    }
    return result;
};

const getMetafile = async (type, id) => {
    console.log('call service get meta file type : ' + type + 'id : ' + id);
    let currentMetafile;
    const idObject = mongoose.Types.ObjectId(id);
    currentMetafile = type === 'id' ? await MetafileModel.findById(id).select('-__v').lean().exec() : await MetafileModel.findOne({fileId: idObject}).select('-__v').lean().exec();
    return currentMetafile;
};

const getMetafileAws = async (key) => {
    console.log('call service get meta file bucketKey : ' + key);
    let currentMetafile;
    currentMetafile = await MetafileModel.findOne({bucketKey: key}).select('-__v').lean().exec();
    return currentMetafile;
};

const getMetafileByOwner = async (ownerId) => {
    console.log('call service get metafile by owner ownerId ' + ownerId);
    let currentMetafile = await MetafileModel.find({owner: ownerId}).select('-__v').lean().exec();
    return currentMetafile;
};

const deleteMetafile = async (id) => {
    console.log('delete Metafile service id : ' + id);
    let result = await MetafileModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteMetafile: deleteMetafile,
    getMetafile: getMetafile,
    getMetafileAws: getMetafileAws,
    updateMetafile: updateMetafile,
    getAllMetafiles: getAllMetafiles,
    createMetafile: createMetafile,
    createMetafileAws: createMetafileAws,
    getMetafileByOwner: getMetafileByOwner,
};
