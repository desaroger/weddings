
const config = require('config');
const Monk = require('monk');

module.exports = Monk(config.mongo);
