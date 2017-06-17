
const db = require('./db');
const {random} = require('../utils');

let AccessToken = db.get('AccessToken');
AccessToken.createIndex('userId', {unique: true});
AccessToken.createIndex('token', {unique: true});

Object.assign(AccessToken, {

    async create(id) {
        let accessToken = await this.findOne({userId: id});
        if (!accessToken) {
            let token = await this.generateToken();
            accessToken = await this.insert({token, userId: id})
        }
        return accessToken;
    },

    async generateToken() {
        return await random.token(60);
    }

});

module.exports = AccessToken;
