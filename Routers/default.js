var MongoClient = require('mongodb').MongoClient;
var bosszhipin = require('../libs/bosszhaopin');
var lagou = require('../libs/lagou');
var zhaopin = require('../libs/zhaopin');
var _ = require("underscore");
var url = 'mongodb://localhost:27017/zhaoping';
var Router = require('../libs/Router');
var co = require('co');
var debug = require('debug')('spider:Router:default');

module.exports = function (app) {
    var router = new Router();
    app.use(router.routes());
    app.use(router.allowedMethods());
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
        db.close();
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
        db.close();

        ctx.body = {
            datas: data.map((x) => {
                return _.extend(x, x["_id"]);
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
        db.close();
        ctx.body = {
            datas: data.map((x) => {
                return _.extend(x, x["_id"]);
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

        if (sort == "salary") {
            sortwhere = {};
            sortwhere["s_sort"] = dir == "ASC" ? -1 : 1;
        }

        debug("list where:%O", sortwhere);
        return co(function* () {
            var db, data, count;
            db = yield MongoClient.connect(url);
            data = yield db.collection('infos').find(where).sort(sortwhere).skip(start).limit(limit).toArray();
            count = yield db.collection('infos').find(where).count();
            db.close();
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
            debug("list err:%O", err);
            ctx.body = {
                "total": "0",
                "topics": []
            }
        });

    });



    router.get('/spider', function (ctx) {
        var param = ctx.request.query;
        var pages = param["pages"] || 5;

        function salaryOpt(row) {
            var salary = row["salary"];
            while (true) {
                //15k-30k
                if (/(\d+)k-(\d+)k/i.test(salary)) {
                    row["s_sort"] = Number(RegExp.$1) * 1000;
                    break;
                }
                //15000-30000
                if (/(\d+)-(\d+)/.test(salary)) {
                    row["s_sort"] = Number(RegExp.$1);
                    row["salary"] = `${parseInt(Number(RegExp.$1) / 1000)}k-${parseInt(Number(RegExp.$2) / 1000)}k`;
                    break;
                }
                row["s_sort"] = 0;
                row["salary"] = row["salary"].toLowerCase();
                break;
            }
        }

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
                        salaryOpt(row);
                        return row;
                    });

                    await db.collection('infos').insertMany(data);

                    data = (await lagou.getDataPromise(pages)).map(row => {
                        var newRow = _.pick(row, 'positionName', 'salary', 'city', 'workYear', 'education', 'industryField', 'financeStage', 'companySize');
                        newRow["company"] = row["companyFullName"];
                        newRow["_from"] = "拉勾";
                        newRow["url"] = `https://www.lagou.com/jobs/${row["positionId"]}.html`;
                        salaryOpt(newRow);
                        return newRow;
                    });

                    await db.collection('infos').insertMany(data);


                    data = (await zhaopin.getDataPromise(pages)).map(row => {
                        row["_from"] = "智联";
                        salaryOpt(row);
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
                    debug("spider err:%O", err);
                    reject(ex);
                }

            })(pages);


        }).then(function (result) {
            ctx.body = result;
        }).catch(function (err) {
            debug("spider2 err:%O", err);
            ctx.body = {
                "success": false
            };
        });
    });

}