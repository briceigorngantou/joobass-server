const RoleModel = require('../configs/models/role');

const createRole = async (Role) => {
    const newRole = new RoleModel(Role);
    let result = await newRole.save();
    return result;
};

const getAllRoles = async (perPage, page) => {
    let result = await RoleModel.find({}).limit(perPage).skip(perPage * page).select('-__v').lean().exec();
    return result;
};

const updateRoleByUser = async (userId, Role) => {
    let result;
    const currentRole = await RoleModel.findOne({'userId': userId}).exec();
    let roles = currentRole.permissionLevel;
    if (!roles.includes(Role)) {
        roles.push(Role);
    }
    if (currentRole) {
        currentRole.set({'userId': userId, 'role': roles});
        result = await currentRole.save();
        return result;
    } else {
        return null;
    }
};

const getRoleByUser = async (userId) => {
    let Role = await RoleModel.findOne({'userId': userId}).lean().exec();
    return Role;
};

const deleteRole = async (id) => {
    let result = await RoleModel.deleteOne({'_id': id}).exec();
    return result.deletedCount > 0;
};

module.exports = {
    deleteRole: deleteRole,
    getRoleByUser: getRoleByUser,
    updateRoleByUser: updateRoleByUser,
    getAllRoles: getAllRoles,
    createRole: createRole,
};
