
const KoaBodyParser = require('koa-bodyparser');

module.exports = (app) => {
    app.use(KoaBodyParser());
};
