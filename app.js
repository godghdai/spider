const bosszhipin = require('./bosszhaopin'),
    MongoClient = require('mongodb').MongoClient,
    convert = require('koa-convert'),
    lagou = require('./lagou'),
    co = require('co'),
    _ = require("underscore");
var Koa = require('koa');
var Router = require('koa-router');
var router = new Router();
var app = new Koa();
var cors = require('koa-cors');
var static = require('koa-static');
var url = 'mongodb://localhost:27017/zhaoping';
app.use(convert(cors()));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(static(__dirname + '/ext-4.2.1.883'));

router.get('/list', function(ctx) {
    var param = ctx.request.query;
    var page = param["page"],
        start = Number(param["start"]),
        limit = Number(param["limit"]),
        sort = param["sort"],
        dir = param["dir"],
        where = {},
        sortwhere = {};
    if (param["_from"] != "") {
        where["_from"] = param["_from"];
    }

    if (param["_city"] != "") {
        where["city"] = param["_city"];
    }

    if (param["_companyName"] != "") {
        where["company"] = new RegExp(param["_companyName"]);
    }

    sortwhere[sort] = dir == "ASC" ? -1 : 1;

    console.dir(where);
    return co(function*() {
        var db, data, count;
        db = yield MongoClient.connect(url);
        data = yield db.collection('infos').find(where).sort(sortwhere).skip(start).limit(limit).toArray();
        count = yield db.collection('infos').find(where).count();
        return {
            "data": data,
            "total": count
        };
    }).then(function(result) {
        ctx.body = {
            "total": result.total,
            "topics": result.data
        }
    }, function(err) {
        console.dir(err);
        ctx.body = {
            "total": "0",
            "topics": []
        }
    });

    /*
    return .then(function(db) {
        return db.collection('infos').find({}).skip(start).limit(limit).toArray();
    }).then(function(infos) {
        ctx.body = {
            "total": "3520",
            "topics": infos
        };

    });*/

});



router.get('/spider', function(ctx) {
    var param = ctx.request.query;
    var pages = param["pages"] || 5;
    return new Promise(function(resolve, reject) {

        (async(pages) => {
            try {
                var db, data, total;
                db = await MongoClient.connect(url);
                if (_.find(await db.listCollections().toArray(), item => {
                        return item.name == "infos";
                    })) {
                    await db.dropCollection('infos');
                }

                data = (await bosszhipin.getDataPromise(pages)).map(row => {
                    row["_from"] = "BOSS招聘";
                    return row;
                });

                await db.collection('infos').insertMany(data);

                data = (await lagou.getDataPromise(pages)).map(row => {
                    var newRow = _.pick(row, 'positionName', 'salary', 'city', 'workYear', 'education', 'company', 'industryField', 'financeStage', 'companySize');
                    newRow["_from"] = "拉勾";
                    return newRow;
                });

                await db.collection('infos').insertMany(data);

                //infos = await db.collection('infos').find({}).toArray();
                //console.dir(infos);
                total = await db.collection('infos').count();

                db.close();
                resolve({
                    "success": true,
                    "total": total
                });
            } catch (ex) {
                console.dir(ex);
                reject(ex);
            }

        })(pages);


    }).then(function(result) {
        ctx.body = result;
    }).catch(function(err) {
        console.dir(err);
        ctx.body = {
            "success": false
        };
    });
});

router.post('/test', function(ctx) {
    var param = ctx.request.query;
    var time = param["time"] || 100;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve({
                "success": true
            });
        }, Number(time));

    }).then(function(result) {
        ctx.body = result;
    }).catch(function(err) {
        console.dir(err);
        ctx.body = {
            "success": false
        };
    });
});

app.listen(3000);
console.log('listening on port 3000');
let child_process = require('child_process'),
    openurl = 'http://localhost:3000/',
    cmd;

if (process.platform == 'win32') {
    cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
} else if (process.platform == 'linux') {
    cmd = 'xdg-open';
} else if (process.platform == 'darwin') {
    cmd = 'open';
}

console.dir(process.platform);
child_process.exec(`${cmd} "${openurl}"`);

return;

/*
(async(pages) => {
    try {
        var db, data, infos;
        db = await MongoClient.connect(url);
        if (_.find(await db.listCollections().toArray(), item => {
                return item.name == "infos";
            })) {
            await db.dropCollection('infos');
        }

        data = (await bosszhipin.getDataPromise(pages)).map(row => {
            row["_from"] = "BOSS招聘";
            return row;
        });

        await db.collection('infos').insertMany(data);

        data = (await lagou.getDataPromise(pages)).map(row => {
            var newRow = _.pick(row, 'positionName', 'salary', 'city', 'workYear', 'education', 'company', 'industryField', 'financeStage', 'companySize');
            newRow["_from"] = "lagou";
            return newRow;
        });

        await db.collection('infos').insertMany(data);

        infos = await db.collection('infos').find({}).toArray();
        console.dir(infos);
        console.dir(await db.collection('infos').count());

        db.close();
    } catch (ex) {
        console.dir(ex);
    }

})(5);
*/



(async() => {
    try {
        var db, infos, data;
        db = await MongoClient.connect(url);

        console.dir(await db.collection('infos').find({}).count());

        data = await db.collection('infos').aggregate([{
            $match: {}
        }, {
            $group: {
                _id: '$city',
                sum: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                "sum": -1
            }
        }]).toArray();
        console.dir(data);

        data = await db.collection('infos').aggregate([{
            $match: {}
        }, {
            $group: {
                _id: {
                    from: '$_from',
                    city: '$city'
                },
                sum: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                "_id.from": 1,
                "sum": -1
            }
        }]).toArray();
        console.dir(data);


        data = await db.collection('infos').aggregate([{
            $match: {

            }
        }, {
            $group: {
                _id: {
                    city: '$city',
                    salary: '$salary'
                },
                sum: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                "_id.city": 1,
                "sum": -1
            }
        }]).toArray();
        console.dir(data);

        db.close();
    } catch (ex) {
        console.dir(ex);
    }

})();