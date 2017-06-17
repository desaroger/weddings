
const config = require('config');
const unless = require('koa-unless');
const {User} = require('../models');

module.exports = (app) => {
    app.keys = config.cookiesKeys;
    app.use(async (ctx, next) => {
        let token = ctx.cookies.get('token');
        let user = await User.findByToken(token);
        ctx.state.user = user || null;
        await next();
    });


    // Protect routes, only logged
    let protect = async (ctx, next) => {
        if (!ctx.state.user) {
            ctx.redirect('/login');
        } else {
            await next();
        }
    };
    protect.unless = unless;
    app.use(protect.unless({path: ['/login', '/register']}));

    let protectAdmin = async (ctx, next) => {
        if (!ctx.state.user) {
            ctx.redirect('/login');
        } else if (!ctx.state.user.admin) {
            ctx.redirect('/');
        } else {
            await next();
        }
    };
    protectAdmin.unless = unless;
    app.use(protectAdmin.unless({path: [/^\/(?!admin)/]}));

};
