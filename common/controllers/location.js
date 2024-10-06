const locationService = require('../../services/location');
const error_processing = require("../utils/error_processing");

const getLocationBySearch = async (req, res, next) => {
    try {
        const searchText = req.params.text;
        let result = await locationService.getSuggestionPlace(searchText);
        let finalResult = result.map(result => {
            return {
                'description': result.description,
                'data': result.terms
            }
        });
        return res.status(200).json({
            'data': finalResult
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getLocationByPlaceId = async (req, res, next) => {
    try {
        const placeId = req.params.placeId;
        let finalResult = await locationService.getLocationByPlaceId(placeId);
        return res.status(200).json({
            'data': finalResult
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    getLocationBySearch: getLocationBySearch,
    getLocationByPlaceId: getLocationByPlaceId
};
