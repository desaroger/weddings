
module.exports = {
    db: require('./db'),
    Monk: require('monk'),
    User: require('./User'),
    AccessToken: require('./AccessToken'),
    Gift: require('./Gift'),
    Purchase: require('./Purchase'),
    Comment: require('./Comment'),
    Preferences: require('./Preferences')
};
