
const db = require('./db');

let Gift = db.get('Gift');

Object.assign(Gift, {

    async populate(array, key = 'giftId') {
        let giftsIds = array.map(item => item[key]);
        let gifts = await this.find({_id: {$in: giftsIds}});
        let giftsMap = gifts.reduce((total, gift) => {
            total[gift._id] = gift;
            return total;
        }, {});
        return array.map(item => {
            item.gift = giftsMap[item[key]];
            return item;
        });
    }

});

module.exports = Gift;
