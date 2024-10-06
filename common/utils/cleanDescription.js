const anonymizeText = (wordToReplace,newWord,text) => {
    let regex ;
    regex = new RegExp(wordToReplace + ".*? ", "gi");
    text = text.replace(regex, " " + newWord + " ");
    text = deleteLinkAndMail(text) ;
    return text ;
};

const removePhoneNumber= (text,newPhoneNumber) => {
    let regex ;
    regex = /(([+]|00)?(237)?[\s.-]{0,3}(\(0\)[\s.-]{0,3})?|6)[1-9](([\s.-]?\d{2}){4}|\d{2}([\s.-]?\d{3}){2})/g;
    text = text.replace(regex, newPhoneNumber);
    return text ;
};

const strNoAccent = (a)=> {
    let b = "áàâäãåçéèêëíïîìñóòôöõúùûüýÁÀÂÄÃÅÇÉÈÊËÍÏÎÌÑÓÒÔÖÕÚÙÛÜÝ",
        c = "aaaaaaceeeeiiiinooooouuuuyAAAAAACEEEEIIIINOOOOOUUUUY",
        d = "";
    let i = 0, j = a.length;
    for(; i < j; i++) {
        const e = a.substr(i, 1);
        d += (b.indexOf(e) !== -1) ? c.substr(b.indexOf(e), 1) : e;
    }
    return d;
}


const deleteLinkAndMail = (text) => {

    const email = /\S+@\S+\.\S+/gi;
    let regex = new RegExp(email, "gi");
    text = text.replace(regex, "contact@jobass.cm");
    // link deletion
    const link = /[ ](http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/g;
    regex = new RegExp(link);
    text = text.replace(regex, " www.jobass.fr");
    return text;
};


module.exports = {
    anonymizeText: anonymizeText,
    strNoAccent: strNoAccent,
    removePhoneNumber: removePhoneNumber
};
