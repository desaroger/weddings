
const _ = require('lodash');
const db = require('./db');
const urlMatcher = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*))?/gi;

let Purchase = db.get('Comment');
Purchase.createIndex('userId');

Object.assign(Purchase, {

    parseLinks(content) {
        if (_.isArray(content)) {
            return content.map(c => Purchase.parseLinks(c));
        } else if (_.isObjectLike(content)) {
            content.content = Purchase.parseLinks(content.content);
            return content;
        }
        content = content.replace(urlMatcher, '<a href="$1" target="_blank">$1</a>');
        return content;
    }

});

module.exports = Purchase;
