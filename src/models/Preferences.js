
const db = require('./db');

let Preferences = db.get('Preference');
Preferences.createIndex('key');

let cache = {};
Object.assign(Preferences, {

    async set(key, value) {
        await this.findOneAndUpdate({key}, {$set: {value}});
        cache[key] = value;
    },

    get(key) {
        if (!key) {
            return cache;
        }
        return cache[key];
        // return (await this.findOne({key})) || null;
    },

    async fillCache() {
        let preferences = await this.find();
        cache = {};
        preferences.forEach((preference) => {
            cache[preference.key] = preference.value;
        });
        console.log('cache', cache);
    }
});

Preferences.fillCache();

module.exports = Preferences;
