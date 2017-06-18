
const KoaPug = require('koa-pug');

module.exports = (app) => {

    let pug = new KoaPug({
        viewPath: './src/views',
        debug: true,
        basedir: './src/views',
        helperPath: [
            {
                activated(currentUrl, linkUrl) {
                    if (currentUrl == linkUrl) {
                        return 'active';
                    }
                    return '';
                }
            }
        ]
    });

    pug.use(app);
    app.use((ctx, next) => {
        ctx.state.url = ctx.url;
        return next();
    })
};
