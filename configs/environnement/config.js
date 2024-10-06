/** *****
 * environment.js file
 *******/

const _ = require('lodash');
let env = process.env.NODE_ENV || 'dev';
env = './' + env;
env = env.trim();
console.log('env : ' + env);
const envConfig = require(env);
const defaultConfig = {
    env: env,
};
module.exports = _.merge(defaultConfig, envConfig);
