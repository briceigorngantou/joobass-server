    const particularService = require('../services/particular');
    const companyService = require('../services/company');
    const notificationService = require('../services/notification');

    const generateAffiliationCode = async (userType, newUser) => {
        const uperBound = 9999;
        const newUserCodeAffiliation = userType.toLowerCase() === "particular" ? newUser.name.substring(0, 2).toLowerCase() + newUser.surname.substring(0, 4).toLowerCase() + (Math.ceil(Math.random() * uperBound).toString()) : newUser.name.substring(0, 6).toLowerCase() + (Math.ceil(Math.random() * uperBound).toString());
        return newUserCodeAffiliation ;
    }; 

    const affiliate = async (codeAffiliation, affiliate_data) => {

        let userType = "particular";
        let userFromAffiliation = await particularService.getParticular("affiliation", codeAffiliation);
        if (!userFromAffiliation) {
            userType = "company";
            userFromAffiliation = await companyService.getCompany("affiliation", codeAffiliation);
        }
                                                                                                                                             
        if (userFromAffiliation) {
            userType.toLowerCase() === "particular" ? await particularService.updateParticular(userFromAffiliation._id, {"affiliation.count": userFromAffiliation.affiliation.count + 1})
                : await companyService.updateCompany(userFromAffiliation._id, {"affiliation.count": userFromAffiliation.affiliation.count + 1});
            //Notify the user who brought a new one
            const userNotification = {
                receiver: userFromAffiliation._id,
                text: userType.toLowerCase() === "particular" ? affiliate_data.surname + " " + affiliate_data.name + " s'est inscrit(e)  sur Jobaas grâce à vous !": "L'entreprise  " + affiliate_data.nameCompany + " s'est inscrit(e)  sur Jobaas grâce à vous !",
                type_event: "affiliation",
                notifUrl: `/fr/me/profile/notifications`
            };
            await notificationService.createNotification(userNotification);
        return userFromAffiliation
        }
        else {
            return null
        }
    };            

    module.exports = {
        affiliate:affiliate,
        generateAffiliationCode:generateAffiliationCode
    };
    