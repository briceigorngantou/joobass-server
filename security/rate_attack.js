const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const config = require('../configs/environnement/config');
const particularService = require('../services/particular');
const IP_ADMIN = config.IP_ADMIN;
const publicIp = require('public-ip');
/*
var redis = require('redis'),
    client = redis.createClient(
        {
            url: config.redis_url
        }
    );


 */

/*
client.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
});

 */

//TODO RATE LIMIER FOR ADMIN
const attackLimiter = function (message) {
     client.keys('*', function (err, keys) {
        console.log('JE CHERCHE LES CLES');
        if (err) return console.log(err);
        console.log('number of keys : ' + keys.length);
        for(let i = 0, len = keys.length; i < len; i++) {
            console.log('there is the key: ' + keys[i]);
            client.get(keys[i], function (error, value) {
                if (error) throw error;
                console.log('key :' +  keys[i] + 'value :' + value);
            });
        }
    });
    const limiter = new RateLimit({
        store: new RedisStore({
            redisURL: config.redis_url,
            expiry: config.rate_block_limit_seconds,
            resetExpiryOnChange: true
        }),
        max: 6,
        message: {'message': message},
        windowMs: config.rate_limit_in_milliseconds,
        keyGenerator: function (req) {
            return req.body.email;
        },
        handler: async function(req, res, /*next*/) {
            await particularService.updateParticular(req.body.email, {'valid': false}, 0);
            res.status(429).
            send({'message': message});
        }
    });
    return limiter;
};

const limitIp = async function (req, res, next) {
    if (config.hostname === 'jobaas.cm') {
        const requestIP = await publicIp.v4();
        if (IP_ADMIN.indexOf(requestIP) >= 0) {
            next();
        } else {
            res.status(403).send({'message': 'You are not allowed to access this route'});
        }
    } else {
        next();
    }
};


module.exports = {
    attackLimiter: attackLimiter,
    limitIp: limitIp
};
