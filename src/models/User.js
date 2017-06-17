
const db = require('./db');
const bcrypt = require('bcrypt');
const AccessToken = require('./AccessToken');
const {CustomError} = require('../utils');

let User = db.get('User');
User.createIndex('username', {unique: true});

Object.assign(User, {

    async login({username, password}) {
        let user = await this.findOne({username});
        if (!user) {
            throw new CustomError(`Email not found`, 401);
        }
        if (!await this.checkPassword(password, user.password)) {
            throw new CustomError(`Password doesn't match`, 401);
        }

        return await AccessToken.create(user._id);
    },

    async register({description, username, password}) {
        let user = await this.findOne({username});
        if (user) {
            throw new CustomError(`Email in use`, 401);
        }
        password = await this.hashPassword(password);
        user = await this.insert({description, username, password, admin: false});

        return await AccessToken.create(user._id);
    },

    async findByToken(token) {
        if (!token) {
            return null;
        }
        let accessToken = await AccessToken.findOne({token});
        if (!accessToken) {
            return null;
        }
        let user = await User.findOne({_id: accessToken.userId});
        return user || null;
    },

    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    },

    async checkPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

});

module.exports = User;
