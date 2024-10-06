const {body, query, param} = require('express-validator');
const tags = require('../common/utils/enum').tags;
const schoolLevel = require('../common/utils/enum').schoolLevel;
const driver_category = require('../common/utils/enum').driver_category;
const vehicles = require('../common/utils/enum').vehicles;

const containProhibited = function (value, state) {
    let prohibited;
    if (state === 1) {
        prohibited = ["script", "<", ">", "$", "/", "\\", "]", "[", "{", "}", "*", "="];
    } else {
        prohibited = ["script", "<", ">", "$", ":", ",", ".", "!", "(", ")", ";", "%", "/", "\\", "]", "[", "^", "{", "}", "*", "="];
    }
    for (let i = 0; i < prohibited.length; i++) {
        if (value.includes(prohibited[i])) {
            return false;
        }
    }
    return true;
};

const isCameroonianPhoneNumber = (value) => {
    let tmp = value.toString();
    return !(tmp.length !== 9 || (!tmp.startsWith('6') && !tmp.startsWith('2')));
};

exports.validate = (method) => {
    switch (method) {
        case 'createUser': {
            return [
                body('name', 'The name is required')
                    .exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in name')
                        }
                        return true;
                    }).escape().blacklist('<>{}$:;!'),
                body('surname', 'surname is required').exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in surname');
                        }
                        return true;
                    })
                    .escape()
                    .blacklist("<>$!{}#&;:")
                    .customSanitizer((value) => {
                        return value.charAt(0).toUpperCase() + value.slice(1);
                    }),
                body('email.valid').optional().isBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value to email.valid');
                    }
                    return true;
                }),
                body('profession', 'profession is a text field only').optional().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in surname');
                        }
                        return true;
                    })
                    .escape()
                    .blacklist("<>$!{}#&;:"),
                body('description', 'The description is a text')
                    .optional().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 1)) {
                            throw new Error('There are malicious character like <$:; in description')
                        }
                        return true;
                    }).escape().blacklist('<>{}$'),
                body('gender', 'choose between Man and Woman').optional().isString().isIn(['Man', 'Woman']),
                body('password', 'password is required').exists().isString(),
                body('MoneyAccount', 'Must be an array of Number').optional().isArray().isInt(),
                body('phoneNumber.valid').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value to phoneNumber.valid');
                    }
                    return true;
                }),
                body('phoneNumber.requestId').isEmpty(),
                body('valid').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value true to valid');
                    }
                    return true;
                }),
                body('schoolLevel.valid', 'Must be boolean Value').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value true to schoolLevel valid');
                    }
                    return true;
                }),
                body('schoolLevel.level', 'School level Must be chosen in the list').optional().isString()
                    .isIn(schoolLevel),
                body('profilePic.valid').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value true to profilePic valid');
                    }
                    return true;
                }),
                body('identityCard.valid').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value true to identityCard valid');
                    }
                    return true;
                }),
                body('skills').optional().isArray().escape()
                    .custom((skillsTab) => {
                        for (let j = 0; j < skillsTab.length; j++) {
                            if (!containProhibited(skillsTab[j], 1)) {
                                throw new Error('There are malicious character like <$:; in skills')
                            }
                        }
                        return true;
                    }),
                body('software').optional().isArray().escape()
                    .custom((Tab) => {
                        for (let j = 0; j < Tab.length; j++) {
                            if (!containProhibited(Tab[j], 1)) {
                                throw new Error('There are malicious character like <$:; in software')
                            }
                        }
                        return true;
                    }),
                body('town', 'The town is required')
                    .exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in town')
                        }
                        return true;
                    }).escape().blacklist('<>{}$:;!'),
                body('street')
                    .optional().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in name')
                        }
                        return true;
                    }).escape().blacklist('<>{}$:;!'),
                body('referenceStreet').optional().isString().trim().escape().blacklist('%)(]['),
                body('emailUsed').optional().toBoolean(),
                body('validationToken').isEmpty(),
                body('birthday').isString().escape().blacklist('<>{}$:;!'),
                body('state').isArray().isIn(['employee', 'employer']),
                body('driver_permit.verified').optional().toBoolean().custom((value) => {
                    if (value === true) {
                        throw new Error('You can not assign a value true to driver_permit valid');
                    }
                    return true;
                }),
                body('driver_permit.category').optional().isString().isIn(driver_category),
                body('profilePic.url').optional().isURL(),
                body('identityCard.url').optional().isURL(),
                body('driver_permit.vehicle').optional().isString().isIn(vehicles),
                body('tags').optional().isArray().isIn(tags)
            ]
        }
        case 'createProspect': {
            return [
                body('name', 'The name is required')
                    .exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in name')
                        }
                        return true;
                    }).escape().blacklist('<>{}$:;!'),
                body('surname', 'surname is required').exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in surname');
                        }
                        return true;
                    })
                    .escape()
                    .blacklist("<>$!{}#&;:")
                    .customSanitizer((value) => {
                        return value.charAt(0).toUpperCase() + value.slice(1);
                    }),
                body('email', 'Invalid email').optional().isString().isEmail(),
                body('gender', 'choose between Man and Woman').optional().isString().isIn(['Man', 'Woman']),
                body('town', 'The town is required')
                    .exists().isString().trim()
                    .custom((value) => {
                        if (!containProhibited(value, 2)) {
                            throw new Error('There are malicious character like <$:; in town')
                        }
                        return true;
                    }).escape().blacklist('<>{}$:;!'),
            ]
        }
    }
};

