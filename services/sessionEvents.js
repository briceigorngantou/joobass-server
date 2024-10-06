const sessionEventModel = require('../configs/models/sessionEvents');

const createSessionEvents = async (sessionEvents) => {
    const newSessionEvents = new sessionEventModel(sessionEvents);
    let result = await newSessionEvents.save();
    return {sessionId: result.sessionId};
};

module.exports = {
    createSessionEvents: createSessionEvents,
};
