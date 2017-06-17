
const KoaPug = require('koa-pug');

module.exports = (app) => {

    let pug = new KoaPug({
        viewPath: './src/views',
        debug: true,
        basedir: './src/views'
    });

    pug.use(app);
};
