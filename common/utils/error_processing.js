class BusinessError extends Error {
    constructor(message, messageFr, errorCode, type, lang, resource = "undefined") {
        super(message);
        this.messageFr = messageFr;
        this.code =  errorCode;
        this.type = type;
        this.lang = lang ? lang : 'en';
        this.resource = resource;
    }
}

class ServerError extends Error {
    constructor(error, lang) {
        super();
        this.error = error;
        this.lang = lang ? lang : 'en';
    }
}

const process = (error) => {
    let lang = error.lang;
    error = error.error ? error.error : error;
    if (error.code === 11000 && error.errmsg.includes("E11000 duplicate key error collection")) {
        return process_duplicate(error, lang)
    } else if (error.errors) {
        let message = error.errors[Object.keys(error.errors)[0]]["message"];
        return message.includes("Cast to ") ? process_cast_error(error, lang) : message.replace("Path", "").replace(".value", "");
    } else if (error.type === "business") {
        return lang === 'fr' ? error.messageFr : error.message;
    } else if (error.type === "classic") {
        if (error.code === 404) {
            return lang === 'fr' ? "Il n'y a aucune ressource <<" + error.resource + ">> associée à cette identifiant" : "there is no" + error.resource + " associated with this id";
        }
    } else {
        return lang === 'fr' ? "Une erreur est survenue dans le serveur. Veuillez réessayer plus tard s'il vous plait. Nous nous excusons pour le désagrément occasionné" : "Something went wrong, Please try again. We are sorry about that";
    }
};

const process_duplicate = (error, lang) => {
    let raw = error.errmsg.split("{")[1];
    let field = raw.split(":")[0].split(".")[0]
    let value = raw.split(":")[1].replace("}", "").replace(".0", "")
    return lang === 'fr' ? `Un utilisateur avec  ${field}  ${value}  existe deja` :
        `An user with ${field}  ${value} already exists`;
};

//TODO
const process_less_than = (error, lang) => {

};

const process_cast_error = (error, lang) => {
    let message = error.errors[Object.keys(error.errors)[0]]["message"];
    let words = message.split(" ");
    return lang === 'fr' ? words[words.length - 1] + " should be of type " + words[2] :
        words[words.length - 1] + " Doit être de type " + words[2];
};

const generateResponse = (ressource, operation, responseCode, lang, custom_message, specific = false) => {

    let message ;
    const frenchGrammar = {
        "administrator": "la",
        "application": {"traduction": "candidature", "article": "la", "accord": "e"},
        "company": {"traduction": "entreprise", "article": "l'", "accord": "e"},
        "evaluation": {"traduction": "evaluation", "article": "l'", "accord": "e"},
        "job": {"traduction": "job", "article": "le", "accord": ""},
        "notification": {"traduction": "notifiction", "article": "la", "accord": "e"},
        "litigation": {"traduction": "litigation", "article": "la", "accord": "e"},
        "transaction": {"traduction": "transaction", "article": "la", "accord": "e"},
        "particular": {"traduction": "particulier", "article": "le", "accord": ""}
    };

   const frenchOperation = {"delete":"supprimé",
                            "update":"modifié",
       "get": "trouvé"
   };

    if (specific === false){
            if(responseCode === 200) {
                if (lang === 'en'){
                    message = `the ${ressource}  has been ${operation}d`
                }else {
                    message = `${frenchGrammar[ressource].article} ${frenchGrammar[ressource].traduction} a été ${frenchOperation[operation]}${frenchGrammar[ressource].accord}`
                }
            } else if (responseCode === 404) {
                if (lang === 'en') {
                    message = `the ${ressource} hasn't been found`
                } else {
                    message = `${frenchGrammar[ressource].article} ${frenchGrammar[ressource].traduction} n'a pas été trouvé${frenchGrammar[ressource].accord}`
                }
            }
    }
    return message;
};
module.exports = {
    process: process,
    BusinessError: BusinessError,
    ServerError: ServerError,
    generateResponse: generateResponse
};
