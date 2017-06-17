
const KoaRouter = require('koa-router');
const {User, AccessToken} = require('./models');

let router = module.exports = KoaRouter();

router.get('/', async ctx => {
    ctx.render('home');
});

router
    .get('/login', async ctx => {
        ctx.render('login');
    })
    .post('/login', async ctx => {
        try {
            let data = ctx.request.body;
            ctx.assert(data, 400, 'No data received');
            ctx.assert(data.username, 400, 'You must introduce an username');
            ctx.assert(data.password, 400, 'You must introduce a password');
            let accessToken = await User.login(data);
            ctx.cookies.set('token', accessToken.token, {signed: true});
            ctx.redirect('/');
        } catch (error) {
            ctx.render('login', {error})
        }
    })
    .get('/register', async ctx => {
        ctx.render('register');
    })
    .post('/register', async ctx => {
        try {
            let data = ctx.request.body;
            ctx.assert(data, 400, 'No data received');
            ctx.assert(data.description, 400, 'You must introduce a description');
            ctx.assert(data.username, 400, 'You must introduce an username');
            ctx.assert(data.password, 400, 'You must introduce a password');

            let accessToken = await User.register(data);
            ctx.cookies.set('token', accessToken.token, {signed: true});
            ctx.redirect('/');
        } catch (error) {
            ctx.render('register', {error});
        }
    })
    .get('/admin', async ctx => {
        ctx.render('admin/home');
    });






