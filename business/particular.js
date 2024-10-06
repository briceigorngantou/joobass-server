const error_processing = require('../common/utils/error_processing');
const processing = require('../common/utils/processing');

const checkAge = async (req, res, next) => {
    let error;
    try {
        const age = processing.getAge(req.body.birthday);
        if (age < 16) {
            console.log('Age must be greater than 16 : ' + age);
            error = new error_processing.BusinessError("Age must be greater than 16", "Vous devez avoir plus de 16 ans", 400, "business", req.query.lang);
            return res.status(400).json({
                'message': error_processing.process(error)
            });
        } else {
            next();
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const isPasswordGenerated = async (req, res, next) => {
    console.log('generation of a password');
    try {
        req.body.rawPassword = processing.makePassword(8);
        req.body.password = req.body.rawPassword;
        next();
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
}

module.exports = {
    isPasswordGenerated:isPasswordGenerated,
    checkAge: checkAge,
};
