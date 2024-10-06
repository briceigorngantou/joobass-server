const NotificationModel = require('../configs/models/notification');
const processing = require('../common/utils/processing');

const createNotification = async (Notification) => {
    const newNotification = new NotificationModel(Notification);
    let result = await newNotification.save();
    return {id: result._id};
};

const markAsRead = async (id) => {
    const result = await NotificationModel.findByIdAndUpdate(id,
        processing.dotNotate({"readState": true}),
        {
            new: true,
            useFindAndModify: false
        }).select('-_id -__v').exec();
    return result;
};
const markAsReadForUser = async (idUser) => {
    const result = await NotificationModel.updateMany({"receiver": idUser}, {"readState": true})
    return result.n > 0;
};

const getAllNotifications = async (perPage, page, filterParams) => {
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    let length = await NotificationModel.find(filterParams).countDocuments();
    let nbUnread = await NotificationModel.find({
        "readState": false,
        "receiver": filterParams.receiver
    }).countDocuments();

    let result = await NotificationModel.find(filterParams).sort({"date_event": -1}).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    return {"notifications": result, "length": length, "nbUnread": nbUnread};
};

const deleteNotification = async (id) => {
    console.log('delete notification service id : ' + id);
    let result = await NotificationModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteNotification: deleteNotification,
    createNotification: createNotification,
    markAsRead: markAsRead,
    markAsReadForUser: markAsReadForUser,
    getAllNotifications: getAllNotifications
};
