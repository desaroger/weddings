
const _ = require('lodash');
const KoaRouter = require('koa-router');
const {CustomError} = require('./utils');
const {Monk, User, Gift, Purchase, Preferences, Comment} = require('./models');

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
    .get('/logout', async ctx => {
        ctx.cookies.set('token', null, {signed: true});
        ctx.redirect('/login');
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
    .get('/gifts', async ctx => {
        let gifts = await Gift.find();
        ctx.render('gifts/list', {gifts});
    })
    .get('/account', async ctx => {
        let purchases =  await Purchase.find({userId: ctx.state.user._id});
        let giftIds = _.uniq(purchases.map(purchase => purchase.giftId));
        let gifts = await Gift.find({_id: {$in: giftIds}});
        let giftsMap = gifts.reduce((result, gift) => {
            result[gift._id] = gift;
            return result;
        }, {});
        for (let purchase of purchases) {
            purchase.gift = giftsMap[purchase.giftId] || null;
        }
        let preferences = await Preferences.get();

        ctx.render('account', {
            purchases,
            preferences
        });
    })
    .get('/addToCart', async ctx => {
        let query = ctx.query;
        query.giftId = Monk.id(query.giftId);
        let gift = await Gift.findOne({_id: query.giftId});
        if (!gift) {
            throw new CustomError(`Unknown gift ${query.giftId}`);
        }
        let count = await Purchase.count({giftId: query.giftId});
        let totalStock = gift.totalStock;
        if (totalStock === false) {
            // Infinity stock
            await Purchase.insert({
                userId: ctx.state.user._id,
                giftId: query.giftId,
                quantity: query.quantity || 1,
                createdAt: new Date()
            });
            await Gift.findOneAndUpdate({_id: gift._id}, {$set: {stock: count + 1}});
        } else {
            let availableStock = Math.max(0, totalStock - count);
            if (availableStock) {
                await Gift.findOneAndUpdate({_id: gift._id}, {$set: {stock: availableStock - 1}});
                await Purchase.insert({
                    userId: ctx.state.user._id,
                    giftId: query.giftId,
                    quantity: query.quantity || 1,
                    createdAt: new Date()
                });
            }
        }

        ctx.redirect('back');
    })
    .get('/removeFromCart', async ctx => {
        let query = ctx.query;
        query.purchaseId = Monk.id(query.purchaseId);
        let purchase = await Purchase.findOne({_id: query.purchaseId});
        if (!purchase) {
            throw new CustomError(`Unknown purchase ${query.purchaseId}`);
        }
        let gift = await Gift.findOne({_id: purchase.giftId});
        if (!gift) {
            throw new CustomError(`Unknown gift ${purchase.giftId} stored on purchase ${purchase._id}`);
        }
        if (gift.totalStock === false) {
            // Infinity
            await Purchase.findOneAndDelete({_id: query.purchaseId});
            let stock = await Purchase.count({giftId: gift._id});
            await Gift.findOneAndUpdate({_id: purchase.giftId}, {$set: {stock}});
        } else {
            await Purchase.findOneAndDelete({_id: query.purchaseId});
            let count = await Purchase.count({giftId: gift._id});
            let stock = gift.totalStock - count;
            await Gift.findOneAndUpdate({_id: purchase.giftId}, {$set: {stock}});
        }

        ctx.redirect('back');
    })
    .get('/comments', async ctx => {
        let page = parseInt(ctx.query.page || 0);
        let pageSize = 10;
        let options = {
            skip: page * pageSize,
            limit: pageSize,
            sort: {createdAt: -1}
        };

        let comments = await Comment.find({}, options);
        comments = await User.populate(comments);
        comments = Comment.parseLinks(comments);
        let count = await Comment.count();
        let totalPages = Math.ceil(count / pageSize);

        ctx.render('comments', {
            comments,
            count,
            totalPages,
            page
        });
    })
    .post('/comments', async ctx => {
        let data = ctx.request.body;
        _.defaults(data, {
            content: null
        });
        data.userId = ctx.state.user._id;
        data.createdAt = new Date();

        await Comment.insert(data);
        ctx.redirect('/comments');
    })
    .get('/admin', async ctx => {

        // Get purchases populated
        let purchases = await Purchase.find();
        purchases = await Gift.populate(purchases);
        let total = purchases.reduce((total, item) => {
            return total + item.gift.price;
        }, 0);
        let users = await User.find();
        users = users.map(user => {
            user.purchases = purchases.filter(purchase => '' + purchase.userId == '' + user._id);
            user.totalPaid = user.purchases.reduce((total, purchase) => {
                return total + purchase.gift.price;
            }, 0);
            return user;
        });
        
        ctx.render('admin/home', {
            total,
            users,
            purchases
        });
    })
    .get('/admin/gifts/new', async ctx => {
        ctx.render('admin/createGift');
    })
    .post('/admin/gifts/new', async ctx => {
        let data = ctx.request.body;
        _.defaults(data, {
            totalStock: 1
        });
        data.totalStock = parseInt(data.totalStock);
        data.stock = data.totalStock;
        let gift = await Gift.insert(data);
        ctx.redirect(`/admin/gifts/new`);
    });






