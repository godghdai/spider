var Koa = require('koa'),
    Router = require('../Router'),
    request = require('supertest'),
    should = require('should'),
    http = require('http');

describe('Router Test', function () {
    var server, router;
    before(function () {
        var app = new Koa();
        router = new Router();
        router.post('/test', function (ctx) {
            var param = ctx.request.query;
            var time = param["time"] || 100;
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve({
                        "success": true
                    });
                }, Number(time));

            }).then(function (result) {
                ctx.body = result;
            }).catch(function (err) {
                ctx.body = {
                    "success": false
                };
            });
        });

        router.get('/test3', function* (next) {

            this.body = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve({
                        "success": true,
                        "msg": "test3"
                    });
                }, 22);

            })

        });

        router.get('/test4', async function (ctx) {
            ctx.body = await new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve({
                        "success": true,
                        "msg": "test4"
                    });
                }, 22);

            })
        });

        app.use(router.routes());
        server = http.createServer(app.callback());
    });

    after(function () {
        server.close();
    });

    it('Promise写法', function (done) {

        router.get('/promise', function (ctx, next) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(1);
                    ctx.body = { message: 'Hello ' };
                    resolve(next().then(() => {
                        console.log(3);
                    }));

                }, 1);
            });
        }, function (ctx) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(2);
                    ctx.body.message += 'World';
                    resolve();
                }, 1);

            }).then(function (data) {
                ctx.body.message += '!';
            });

        });

        request(server)
            .get('/promise')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.message.should.eql('Hello World!');
                done();
            });
    });

    it('异步函数写法', function (done) {

        router.get('/asyncfunction', async function (ctx, next) {
            ctx.body = await new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(1);
                    resolve({ message: 'Hello ' });
                }, 1);
            });
            await next();
            ctx.body.message += "!";
        }, async function (ctx) {
            var b = await new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(2);
                    resolve("World");
                }, 1);
            })
            ctx.body.message += b;
        });

        request(server)
            .get('/asyncfunction')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.message.should.eql('Hello World!');
                done();
            });
    });



    it('generater函数写法', function (done) {

        router.get('/generater', function* (next) {

            this.body = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(1);
                    resolve({ message: 'Hello' });
                }, 1);
            });
            yield next;
            console.log(3);
            this.body.message += "!";

        }, function* (next) {
            var b = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(2);
                    resolve(" World");
                }, 1);
            })
            this.body.message += b;
        });

        request(server)
            .get('/generater')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.message.should.eql('Hello World!');
                done();
            });
    });




});



