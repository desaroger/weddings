
module.exports = (app) => {

    app.use(redirectWithoutWWW());

};

function redirectWithoutWWW() {
    return async (ctx, next) => {
        let hasWWW = ctx.href.toLowerCase().match(/^http[s]*:\/\/www\./);
        if (hasWWW) {
            let hrefWithoutWWW = ctx.href.replace(/[wW]{3}\./, '');
            ctx.status = 301;
            ctx.redirect(hrefWithoutWWW);
        } else {
            await next();
        }
    }
}