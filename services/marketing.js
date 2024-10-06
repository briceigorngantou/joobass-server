const MarketingModel = require('../configs/models/marketing');

const createMarketing = async (marketingView) => {
    let result;
    const newMarketing = new MarketingModel(marketingView);
    result = await newMarketing.save();
    return {id: result._id};
};

module.exports = {
    createMarketing: createMarketing
};
