
const db = require('./db');

let Preferences = db.get('Preference');
Preferences.createIndex('key');

Object.assign(Preferences, {

    async set(key, value) {
        await this.findOneAndUpdate({key}, {$set: {value}});
    },

    async get() {
        let preferences = await this.find();
        let data = {};
        preferences.forEach((preference) => {
            data[preference.key] = preference.value;
        });
        return data;
    }
});

module.exports = Preferences;
