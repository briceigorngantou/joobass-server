const notificationService = require('../services/notification');
const _ = require('lodash');
const error_processing = require("../common/utils/error_processing");
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;

const createNotification = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const notification = await notificationService.createNotification(req.body);
        message = lang === "fr" ? "Nouvelle notification créée" : "new notification was created";

        console.log('new notification was created');
        return res.status(200).json({
            'message': message,
            'data': notification
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const markAsRead = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    console.log('notif mark as read controller');
    try {
        const notification = await notificationService.markAsRead(req.params.idNotif);
        console.log(' notification mark as readed');
        return res.status(200).json({
            'data': notification
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const markUserRead = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    console.log('notification mark as read controller');
    try {
        const notification = await notificationService.markAsReadForUser(req.jwt.userId);
        console.log('notification for this  mark as read');
        return res.status(200).json({
            'message': notification ? "the notifications of this users have been masked as readed" : "there is no notifaction"
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getAllNotifications = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }
        // for route /me/notifications
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.query.receiver = req.jwt.userId;
        }
        const notifications = await notificationService.getAllNotifications(limit, page, req.query);
        console.log('there are notifications');
        return res.status(200).json({
            'data': notifications
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteNotification = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const notification = await notificationService.deleteNotification(req.params.idNotification);
        if (notification) {
            message = req.query.lang === 'fr' ? 'Suppression de la notification par identifiant' : 'The notification was deleted by id';
            console.log('the notification was deleted by id : ' + req.params.idNotification);
            return res.status(200).json({
                'message': message
            });
        } else {
            console.log('no notification was found by id : ' + req.params.idNotification);
            const err = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, 'Notification');
            return res.status(err.code).json({
                'message': error_processing.process(err)
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


module.exports = {
    deleteNotification: deleteNotification,
    createNotification: createNotification,
    markAsRead: markAsRead,
    markUserRead: markUserRead,
    getAllNotifications: getAllNotifications
};


