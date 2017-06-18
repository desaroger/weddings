
const db = require('./db');

let Purchase = db.get('Purchase');
Purchase.createIndex('userId');
Purchase.createIndex('giftId');

Object.assign(Purchase, {

});

module.exports = Purchase;
