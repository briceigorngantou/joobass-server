//
const config = require('../../configs/environnement/config');

//enum
const stateJob = ["cancelled", "in progress", "completed", "created", "validated", "rejected", "expired", "published", "waiting for payment"];
const contractType =  ["permanent_contract", "fixed_term_contract", "internship", "interim", "Not specified"];
const languageLevel = ['beginner', 'intermediate', 'high', 'professional', 'maternal'];
const schoolLevel = ['6e', '5e', '4e', 'bepc', '2nd', 'probatoire', 'bac', 'bac+1', 'bac+2', 'bac+3', 'bac+4', 'bac+5', 'bac+6'];
const tags = ['Art', 'Education', 'House', 'Delivery',
    'Events', 'Commercial', 'Distribution', 'Transport', 'Technical_support', 'Animals', 'Beauty_bodycare',
    'Sport', 'Health', 'Fashion', 'Web_service', 'Others', 'Network_multimedia',
    'Relocation', 'Office_service', 'Hotel_catering', 'Legal', 'Accounting', 'Administration', 'Bank_finance', 'Chemistry_biology', 'Automobile', 'Electronic_industry', 'Assurance', 'Architect_Building', 'Agriculture'];
const tagsFr = ['Art', 'Education/Scolaire', 'Entretien Maison', 'Livraison',
    'Evènement', 'Commercial', 'Distribution', 'Transport', 'Support technique', 'Entretien des animaux', 'Beauté et soins',
    'Sport', 'Santé', 'Mode', 'Services web', 'Autres', 'Marketing digital',
    'Déménagement', 'Bureautique', 'Hôtellerie & traiteur', 'Droit', 'Comptabilité', 'Administration', 'Banque_finance', 'Chimie_biology', 'Automobile', 'Electroniq_industry', 'Assurance', 'Architect_BTP', 'Agriculture'];
const tagsSchool = ['Education',
    'Events', 'Commercial', 'Technical_support', 'Health', 'Web_service', 'Network_multimedia',
    'Office_service', 'Hotel_catering'];
const origin = ["Friends", "Instagram", "Facebook", "Whatsapp", "LinkedIn", "Youtube", "Twitter", "Video", "Other", "Commercial","Taxi", "Influencer","Sms","School_or_training_center","Radio","Event_exhibition_competition_fair", "Flyer_prospectus", "email"];
const type_event = ["other", "transaction", "rappel_job", "evaluation", "fileManager", "cancel_contract", "reject_application",
    "affiliation", "application", "litigation", "recommendation", "job_subscription", "task_controller", "save_application", "cancel_job", "new_job", "job_validation", "change_role", "job_expired","job_done"];
const driver_category = ['A', 'B', 'C', 'D', 'E', 'AM', 'A1', 'A2', 'B1', 'BE', 'C1E', 'CE', 'D1', 'D1E'];
const vehicles = ['car', 'bike', 'bus'];
const schoolLevelAdmin = ['bac+4', 'bac+5', 'bac+6'];
const stateContract = ['succeed', 'failed',  'in_progress'];
const stateApplication = ['done', 'cancelled', 'validated', 'rejected', 'viewed'];
const stateLitigation = ["resolved", "in progress", "cancelled"];
const language = ['English', 'French', 'Italian', 'Spanish', 'Chinese', 'German'];
const file_tags = ['identity', 'profilePic', 'administrative', 'skill', 'litigation', 'other', 'schoolLevel', 'driver_permit', 'job','cv', 'logo', 'logoBlogArticle'];
const reasons_random_code = ["change_password", "change_mail_adress"];
const type_client = ['new', 'regular', 'cold', 'lost'];
const type_prospect = ['prospect', 'hot_prospect'];
const statusBlogArticle = ["published", "masked", "draft"]
const categoryBlogArticle = ["Jobaas", "interview", "resume", "cover_letter", "administrative", "negotiation", "events", "company", "schools_and_training", "other", "life_at_work"]
const packLevelType = ['One', 'Two', 'Three', 'Four'];
const packLevelTypeWithoutFirst = ['Two', 'Three', 'Four'];
const rhPackLevelType = ['Three', 'Four'];
const status_blogArticle = ["published", "masked", "draft"]
const theme_status_blogArticle = ["Jobaas", "entretien", "CV", "lettre de motivation",  "administratif", "négociation", "events", "entreprise", "écoles et formations", "autres", "la vie au travail"]
const profileType = ['Admin', 'User'];

const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const RH = config.permissionLevels.RH_USER;
const COMMERCIAL = config.permissionLevels.COMMERCIAL_USER;
const COMMUNICATION = config.permissionLevels.COMMUNICATION_USER;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const EMPLOYER_USER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE_USER = config.permissionLevels.EMPLOYEE_USER;
const adminRights = [ADMIN, CONTROLLER, SUP_ADMIN, RH, COMMERCIAL, COMMUNICATION];
const communicationRights = [ADMIN,  SUP_ADMIN, COMMUNICATION, RH];
const commercialRights = [ADMIN, CONTROLLER, SUP_ADMIN, COMMERCIAL];
const RHRights = [ADMIN, CONTROLLER, SUP_ADMIN, RH];
const userRights = [ENTREPRISE, EMPLOYER_USER, EMPLOYEE_USER];
const jobFilesRequired = ['motivation_letter', 'identity', 'driver_permit', 'last_diploma', 'portfolio']
const typeEventSession = ["offer_seen_by_employee", "employee_click_to_apply", "employee_apply",
    "employer_starts_to create_job_offer", "employer_go_to_payment", "employer_pays",
    "job_offer_is_shared", "job_offer_is_signaled",
    "application_seen_employer"]
const typeObjectOfEvent = ["job", "application"]

const tag_list = {
    "key": tags,
    "fr": ['Art', 'Education/Scolaire', 'Entretien Maison', 'Livraison',
        'Evènement', 'Commercial', 'Distribution', 'Transport', 'Support technique', 'Entretien des animaux', 'Beauté et soins',
        'Sport', 'Santé', 'Mode', 'Services web', 'Autres', 'Marketing digital',
        'Déménagement', 'Bureautique', 'Hôtellerie & traiteur']
};

const domainCollaborators = ["IT", "MarketCom", "Comptabilité", "Gestion de projets", "RH", "Service clients", "Commercial"]
const collaboratorStatus = ["Associé", "Salarié", "Stagiaire", "Support"]


const bdd_to_tag = (entry, lang) => {
    let tagList;
    tagList = lang === 'fr' ? tag_list.fr : tag_list.key;
    let result = [];
    for (let i = 0; i < entry.length; i++) {
        let index = tag_list.key.indexOf(entry[i]);
        result.push(tagList[index]);
    }
    return result;
};

module.exports = {
    stateJob: stateJob,
    contractType:contractType,
    tags: tags,
    bdd_to_tag: bdd_to_tag,
    schoolLevel: schoolLevel,
    driver_category: driver_category,
    vehicles: vehicles,
    schoolLevelAdmin: schoolLevelAdmin,
    stateApplication: stateApplication,
    stateLitigation: stateLitigation,
    adminRights: adminRights,
    commercialRights: commercialRights,
    communicationRights: communicationRights,
    RHRights: RHRights,
    userRights: userRights,
    tagsSchool: tagsSchool,
    type_event: type_event,
    stateContract: stateContract,
    origin_tags: origin,
    file_tags: file_tags,
    language_level: languageLevel,
    language: language,
    tagsFr: tagsFr,
    profileType: profileType,
    reasons_random_code: reasons_random_code,
    type_client: type_client,
    type_prospect: type_prospect,
    typeEventSession : typeEventSession,
    typeObjectOfEvent: typeObjectOfEvent,
    stateBlogArticle: statusBlogArticle,
    categoryBlogArticle: categoryBlogArticle,
    packLevelType: packLevelType,
    packLevelTypeWithoutFirst: packLevelTypeWithoutFirst,
    jobFilesRequired: jobFilesRequired,
    rhPackLevelType: rhPackLevelType,
    stateBlogArticle: status_blogArticle,
    theme_status_blogArticle: theme_status_blogArticle,
    domainCollaborators: domainCollaborators,
    collaboratorStatus: collaboratorStatus,
};
