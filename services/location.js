const axios = require('axios');
const API_KEY_GOOGLE_MAP = require('../configs/environnement/config').API_KEY_GOOGLE_MAP;

const getSuggestionPlace = async (input) => {
    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&key=' + API_KEY_GOOGLE_MAP + '&types=geocode';
    let result = await axios.get(url);
    //console.log(result.data.predictions);
    return result.data.predictions;
};

const getLocationByPlaceId = async (placeId) => {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' +
        placeId + '&fields=geometry&key=' + API_KEY_GOOGLE_MAP;
    let result = await axios.get(url);
    return result.data.result.geometry;
};


module.exports = {
    getSuggestionPlace: getSuggestionPlace,
    getLocationByPlaceId: getLocationByPlaceId
};
