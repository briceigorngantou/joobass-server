const express = require('express');
const locationController = require('../common/controllers/location');
const router = express.Router();


router.get('/:text',
    [
        locationController.getLocationBySearch
    ]);


module.exports = router;
