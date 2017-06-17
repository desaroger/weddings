
const crypto = require('crypto');

module.exports = {
    async token(length) {
        let perfectBytesLength = Math.ceil(length * 0.75);
        let buffer = await this.bytes(perfectBytesLength);
        let base64 = buffer.toString('base64');
        base64 = toBase64UrlSafe(base64);
        base64 = base64.substr(0, length);
        return base64;
    },

    /**
     * Node crypto randomBytes wrapper for promises
     * @param length
     * @returns {Promise<Buffer>}
     */
    bytes(length) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(length, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });
    },
};

function toBase64UrlSafe(x) {
    return x
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}