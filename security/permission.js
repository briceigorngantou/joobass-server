const _ = require('lodash');
const config = require('../configs/environnement/config');
const ADMIN_PERMISSION = config.permissionLevels.ADMIN;
const SUP_ADMIN_PERMISSION = config.permissionLevels.SUP_ADMIN;

const permissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    const assignedRoles = req.jwt.permissionLevel;
    const intercept = _.intersectionWith(assignedRoles, required_permission_level);
      console.log(assignedRoles);
      console.log(required_permission_level);
    if (Array.isArray(assignedRoles) && intercept.length > 0) {
      return next();
    } else {
      const message = ' FORBIDDEN YOU DO NOT HAVE THE REQUIRED PERMISSION ';
        console.log(message);
      return res.status(403).json({
          'message': message
      });
    }
  };
};

const onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const user_permission_level = req.jwt.permissionLevel;
  const userId = req.jwt.userId;
  console.log('jwt : ' + userId + ' params : ' + req.params.id);
  if (req.params && req.params.id && userId === req.params.id) {
    return next();
  } else {
    if (user_permission_level.includes(ADMIN_PERMISSION) || user_permission_level.includes(SUP_ADMIN_PERMISSION)) {
      return next();
    } else {
      const message = ' ONLY THE SAME USER OR ADMIN CAN DO THIS ACTION';
      return res.status(403).json({
        'message': message
      });
    }
  }
};


module.exports = {
  onlySameUserOrAdminCanDoThisAction: onlySameUserOrAdminCanDoThisAction,
  permissionLevelRequired: permissionLevelRequired,
};
