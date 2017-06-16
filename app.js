const bosszhipin = require('./bosszhaopin'),
    MongoClient = require('mongodb').MongoClient,
    convert = require('koa-convert'),
    lagou = require('./lagou'),
    zhaopin = require('./zhaopin'),
    co = require('co'),
    _ = require("underscore");
var Koa = require('koa');
var Router = require('./Router');
var router = new Router();
var app = new Koa();
var cors = require('koa-cors');
var static = require('koa-static');
var url = 'mongodb://localhost:27017/zhaoping',
    path = require('path');


app.use(convert(cors()));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(static(__dirname + '/ext-4.2.1.883'));


/*
var config_json = "zhaoping_cofig.json";
(async () => {
 var page = await zhaopin.getDataPromise();
    return page;
})().then(function(data){
    console.dir(data.length);
}).catch(err => {
    console.dir(err);
});

return;
*/



(async () => {
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




var _ctx = { "data": "a" };
function sss(ctx) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve("sfdsfds");
        }, 100);
    }).then(function (data) {
        ctx["data"] = data;
    });
}

var ssss = async function (ctx) {

    var data = await new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve("abc");
        }, 100);
    });
    ctx["data"] = data;
}




Promise.resolve(ssss(_ctx)).then(function () {
    console.log(_ctx["data"]);
}).catch(function (err) {
    console.dir(err);
});

var later = require('later');
// will fire every 5 minutes
later.date.localTime();
var sched = later.parse.text('every 5 m');
var start = new Date('2017-06-15T03:05:23Z'),
    end = new Date('2017-06-15T12:40:10Z');
var occurrences = later.schedule(sched).next(10, start, end);
for (var i = 0; i < 10; i++) {
    console.log(occurrences[i]);
}

var t = later.setInterval(function () {
    console.log(new Date());
}, sched);
//   // execute logTime one time on the next occurrence of the text schedule
//   var timer = later.setTimeout(logTime, textSched);

//   // execute logTime for each successive occurrence of the text schedule
//   var timer2 = later.setInterval(logTime, textSched);

//   // function to execute
//   function logTime() {
//     console.log(new Date());
//   }


// var cron2 = later.parse.cron('0 0/5 14 * * ?', true);


router.get('/listone', async (ctx) => {

    var db = await MongoClient.connect(url);
    var data = await db.collection('infos').aggregate([{
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

    ctx.body = {
        datas: data
    };

});

router.get('/listtwo', async (ctx) => {

    var db = await MongoClient.connect(url);
    var data = await db.collection('infos').aggregate([{
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

    
    ctx.body = {
        datas: data.map((x) => {
            return _.extend(x,x["_id"]);
        })
    };

});

router.get('/listthree', async (ctx) => {

    var db = await MongoClient.connect(url);
    var data = await db.collection('infos').aggregate([{
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

    ctx.body = {
         datas: data.map((x) => {
            return _.extend(x,x["_id"]);
        })
    };

});


router.get('/list', function (ctx) {
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
    return co(function* () {
        var db, data, count;
        db = yield MongoClient.connect(url);
        data = yield db.collection('infos').find(where).sort(sortwhere).skip(start).limit(limit).toArray();
        count = yield db.collection('infos').find(where).count();
        return {
            "data": data,
            "total": count
        };
    }).then(function (result) {
        ctx.body = {
            "total": result.total,
            "topics": result.data
        }
    }, function (err) {
        console.dir(err);
        ctx.body = {
            "total": "0",
            "topics": []
        }
    });

});



router.get('/spider', function (ctx) {
    var param = ctx.request.query;
    var pages = param["pages"] || 5;
    return new Promise(function (resolve, reject) {

        (async (pages) => {
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
                    newRow["url"] = `https://www.lagou.com/jobs/${row["positionId"]}.html`;
                    return newRow;
                });

                await db.collection('infos').insertMany(data);


                data = (await zhaopin.getDataPromise(pages)).map(row => {
                    row["_from"] = "智联";
                    return row;
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


    }).then(function (result) {
        ctx.body = result;
    }).catch(function (err) {
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

