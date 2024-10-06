const {v4:uuidv4} = require('uuid');

const dotNotate = (obj, target, prefix) => {
    target = target || {};
    prefix = prefix || "";

    Object.keys(obj).forEach(function (key) {
        if (obj[key] !== null && typeof (obj[key]) === "object") {
            dotNotate(obj[key], target, prefix + key + ".");
        } else {
            return target[prefix + key] = obj[key];
        }
    });
    return target;
};

const updateMeanRatings = (oldMean, newNote, old_number_eval) => {
    return (oldMean * old_number_eval + newNote) / (old_number_eval + 1)
};

const conditionsPassword = (pass) => {
    let valid = true;
    let score = 0;
    if (!pass)
        return {valid: false, score: 0};

    //The password should have at least 8 characters
    if (pass.length < 8) {
        return {valid: false, score: score};
    } else {
        // award every unique letter until 5 repetitions
        score = 30;
        let letters = {};
        for (let i = 0; i < pass.length; i++) {
            letters[pass[i]] = (letters[pass[i]] || 0) + 1;
            score += 5.0 / letters[pass[i]];
        }

        // points for mixing it up
        let variations = {
            digits: /\d/.test(pass),
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass)
        };

        let variationCount = 0;
        for (let check in variations) {
            if (variations[check] === true) {
                variationCount += 1;
            } else {
                valid = false;
            }

        }
        score += (variationCount - 1) * 10;

        return {
            valid: valid,
            score: score
        };
    }
};

const makePassword = () => {
    const collectionOfLetters = "*@.+/#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let generatedPassword = "";
    const size = collectionOfLetters.length;
    for (let i = 0; i <= 8; ++i) {
        generatedPassword = generatedPassword + collectionOfLetters.charAt(Math.floor(Math.random() * size));
    }
    return generatedPassword + Math.floor(Math.random() * 9);
};

const getAge = (dateString) => {
    try {
        const today = new Date();
        const birthDate = new Date(dateString);
        return today.getFullYear() - birthDate.getFullYear();
    } catch (e) {
        throw new Error('It is not a date');
    }
};

const incrementDate = (currentDate, nbDaysToAdd) => {
    //current Date must be instance of new Date()
    currentDate.setDate(currentDate.getDate() + nbDaysToAdd);
    return currentDate.toISOString().slice(0, 10);
};

const minusDate = (currentDate, nbDaysToRemove) =>{
    currentDate.setDate(currentDate.getDate() - nbDaysToRemove);
    return currentDate.toISOString().slice(0, 10);
};


const formatFilterParams = (filterParams,excludedKeys) => {
    for (let [key, value] of Object.entries(filterParams)) {
        if (typeof value == "string" && value.length !== 0 && !excludedKeys.includes(key)) {
            if ((new Date(value)).toString() === "Invalid Date") {
                filterParams[key] = new RegExp(value + ".*", "i");
            }
        } else {
            if (value !== undefined && value !== "") {
                filterParams[key] = value
            } else {
                delete filterParams[key];
            }
        }
    }
    return  filterParams;
};

const computePrice = (packLevelType, nbPeople, insuranceChecked, fees, paymentTypeFees, insurancePrice) => {
    let priceXAF;
    if(packLevelType === "One"){
        return 0;
    }else{
        const nbWorkers = packLevelType !== "One" && packLevelType !== "Two"
            ?  Number(nbPeople) : 1;
        if (insuranceChecked) {
            priceXAF = Number(fees)*nbWorkers + Number(insurancePrice) + Number(paymentTypeFees) ;
        }else{
            priceXAF = Number(fees)*nbWorkers + Number(paymentTypeFees);
        }
    }
    return  priceXAF;
};

const toCapitalize = (text) => {
    let textLowed = text.toLowerCase();
    return textLowed.charAt(0).toUpperCase() + textLowed.slice(1);
};

const removeSpecialCharacter = (text) => {
    //TODO NE PAS TENIR COMPTE DES TIRETS DE 6
    return text.replace(/[&\/\\#^+()$~%.'":*?<>{}!@]/g, '');
};

const replaceTagForSEO = (htmlData, tagForSEO) => {
  
    htmlData = htmlData
                .replace(`<meta itemprop="name" content="Accueil | Jobaas | Cameroun">`,
                `<meta itemprop="name" content="${tagForSEO.title}">`)
                .replace(`<meta name="description" content="Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas"/>`,
                `<meta name="description" content="${tagForSEO.description}"/>`)
                .replace(`<meta name="keywords" content="cameroun, jobs, missions, CDI, CDD, saisonniers, emploi, travail, annonce, chômage">`
                ,`<meta name="keywords" content="${tagForSEO.keywords}">`)
                .replace(`<meta itemprop="description" content="Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas">`
                ,`<meta itemprop="description" content="${tagForSEO.description}">`)
                .replace(`<meta itemprop="image" content="https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png">`,
                `<meta itemprop="image" content="${tagForSEO.metaImage}">`)
                .replace(`<meta name="twitter:title" content="Accueil | Jobaas | Cameroun">`,
                `<meta name="twitter:title" content="${tagForSEO.title}">`)
                .replace(`<meta name="twitter:description" content="Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas">`,
                `<meta name="twitter:description" content="${tagForSEO.description}">`)
                .replace(`<meta name="twitter:image" content="https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png">`,
                `<meta name="twitter:image" content="${tagForSEO.metaImage}">`)
                .replace(`<meta property="og:title" content="Accueil | Jobaas | Cameroun"/>`,
                `<meta property="og:title" content="${tagForSEO.title}"/>`)
                .replace(`<meta property="og:url" content="https://www.jobaas.cm"/>`,
                `<meta property="og:url" content="${tagForSEO.url}"/>`)
                .replace(`<meta property="og:image" content="https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png"/>`,
                `<meta property="og:image" content="${tagForSEO.metaImage}"/>`)
                .replace(`<meta property="og:description" content="Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas"/>`,
                `<meta property="og:description" content="${tagForSEO.description}"/>`)
                .replace(`<meta property="article:section" content="Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas"/>`,
                `<meta property="article:section" content="${tagForSEO.description}"/>`);
 
    return htmlData;
};

const getImageRelatedToTag = (tag) =>{
    let imageUrl;
    switch (tag){
        case 'Hotel_catering':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639771418/jobaas/icon_gathering_vxlzmz.jpg";
            break;
        case 'Office_service':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639771621/jobaas/icon_office_wmm9qw.jpg";
            break;
        case 'Relocation':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_relocation_tqvsdl.png";
            break;
        case 'Network_multimedia':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_digital_marketing_fn37vu.jpg";
            break;
        case 'Others':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png";
            break;
        case 'Web_service':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/cion_webservice_k6lg0t.jpg";
            break;
        case 'Fashion':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_mode_s4bbha.png";
            break;
        case 'Health':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_health_pbhdv8.png";
            break;
        case 'Sport':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_sport_u5lxol.jpg";
            break;
        case 'Beauty_bodycare':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639774451/jobaas/icon_body_eicgq5.jpg";
            break;
        case 'Animals':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639770975/jobaas/icon_animals_kbtduk.jpg";
            break;
        case 'Technical_support':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_technical_support_z09vtz.png";
            break;
        case 'Transport':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_driver_w5tuoh.png";
            break;
        case 'Distribution':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757344/jobaas/cion_distribution_dwomxm.png";
            break;
        case 'Commercial':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757344/jobaas/icon_commercial_xmqlh0.png";
            break;
        case 'Events':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/icon_events_zzrpex.png";
            break;
        case 'Delivery':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757343/jobaas/delivery_n9vgyg.png";
            break;
        case 'House':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757344/jobaas/icon_house_c4pfbg.png";
            break;
        case 'Education':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757344/jobaas/education_j2tddy.png";
            break;
        case 'Art':
            imageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1639757344/jobaas/art_ducabz.png";
            break;
    }
    return imageUrl;
};

const createSlug =(title)=>{
    const day = new Date(Date.now());
    let slug;
    slug = title.replace(/\s+/g, "-") + "-" + day.getSeconds() + day.getMinutes() + day.getHours() + day.getDay();
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    slug = slug.toLowerCase();
    return removeSpecialCharacter(slug);
}

const removeItemOnce = (arr, value)=> {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

const removeDuplicates = (arr)=> {
    return [...new Set(arr)];
}

const stringToBoolean =(val) =>{
    if(String(val).toLowerCase() === "true"){
        return true;
    }else if(String(val).toLowerCase() === "false"){
        return false;
    }
}

const getStringRefFromTitle = (title) =>{
    let title_without_punct = title.replace(":", " ").replace("'", " ").replace("?", " ").replace("!", " ").replace(".", " ").replace(";", " ").trim().split().join("-")
    return title_without_punct + "-" + String(uuidv4())
};


module.exports = {
    dotNotate: dotNotate,
    removeItemOnce: removeItemOnce,
    makePassword: makePassword,
    updateMeanRatings: updateMeanRatings,
    securePassword: conditionsPassword,
    computePrice: computePrice,
    getAge: getAge,
    stringToBoolean: stringToBoolean,
    toCapitalize: toCapitalize,
    formatFilterParams:formatFilterParams,
    incrementDate: incrementDate,
    getImageRelatedToTag: getImageRelatedToTag,
    replaceTagForSEO: replaceTagForSEO,
    removeSpecialCharacter: removeSpecialCharacter,
    createSlug: createSlug,
    removeDuplicates: removeDuplicates,
    getStringRefFromTitle: getStringRefFromTitle,
    removeDuplicates: removeDuplicates
};
