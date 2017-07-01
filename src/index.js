

const Koa = require('koa');
const config = require('config');
let router = require('./router');

let app = new Koa();
require('./plugins/www')(app);
require('./plugins/pug')(app);
require('./plugins/bodyParser')(app);
require('./plugins/auth')(app);

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(config.port, () => {
        console.log(`Listening ${config.port}`);
    });
