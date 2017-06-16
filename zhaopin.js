var request = require('superagent'),
    async = require('async'),
    cheerio = require("cheerio"),
    urlencode = require('urlencode'),
    querystring = require("querystring"),
    _ = require("underscore"),
    fs = require('mz/fs'),
    debug = require('debug')('spider:zhaopin'),
    path = require('path');


var bosszhipin = require('./bosszhaopin');
//set debug=spider:*  set debug=null

/* 
thenifyAll = require('thenify-all'),
fs = thenifyAll(require('fs'), {}, [
    'readFile',
    'writeFile'
]);*/
//http://sou.zhaopin.com
var url = "http://sou.zhaopin.com/jobs/searchresult.ashx?jl=" + urlencode("全国") + "&kw=nodejs&isadv=0&p=3";//北京+上海+深圳+广州


/*
var config_json = "zhaoping_cofig.json";
(async () => {
    var savepath = path.join(__dirname, config_json), _json;
    if (await fs.exists(savepath)) _json = JSON.parse(await fs.readFile(savepath, { encoding: 'utf-8' }));
    else {
        _json = await getJson();
        await fs.writeFile(savepath, JSON.stringify(_json, null, 4), 'utf8');
    }
    var page = await bosszhipin.getDataPromise();

    console.dir(page);
})().catch(err => {
    console.dir(err);
});*/


var getPagesJson = function () {
    var result = [];
    return new Promise((resolve, reject) => {
        (async () => {
            var page = 1, data;
            while (true) {
                data = await getPageJson(page);
                result = result.concat(data);
                if (data.length == 0) break;
                page++;
            }
            resolve(result);
        })().catch(err => {
            reject(err);
        });
    });
}


var getPageJson = function (page) {

    return new Promise((resolve, reject) => {
        request.get("http://sou.zhaopin.com/jobs/searchresult.ashx?jl=" + urlencode("全国") + "&kw=nodejs&isadv=0&p=" + page).end(function (err, res) {
            var result = [];
            if (err) {
                debug('err: %O', err);
                reject(err);
                return;
            }
            var $ = cheerio.load(res.text), table, positionName, a;
            $("table.newlist").each(function (i, e) {
                //跳过标题
                if (i != 0) {
                    table = $(e);
                    positionName = table.find(".zwmc").text().replace(/[\r\n]/g, "").replace(/\ +/g, "");
                    debug('positionName: %s', positionName);
                    if (/nodejs/i.test(positionName)) {
                        result.push({
                            "positionName": positionName,
                            "salary": table.find(".zwyx").text(),
                            "city": table.find(".gzdd").text(),
                            "workYear": "",
                            "education": "",
                            "company": table.find(".gsmc").text(),
                            "industryField": "",
                            "financeStage": "",
                            "companySize": "",
                            "url": table.find(".zwmc a").attr("href")
                        });
                    }

                }

            });
            resolve(result);
        })

    });

}


var getJson = function () {
    return new Promise((resolve, reject) => {
        request.get(url).end(function (err, res) {
            var result = {};
            if (err) {
                debug('err: %O', err);
                reject(err);
                return;
            }
            var $ = cheerio.load(res.text);
            $(".newlist_sx").contents().each(function (i, e) {
                if (e.type == "comment") {
                    switch (e.data) {
                        case "职位标签":
                            var fjtDic = {}, params;
                            $(e).next().find(".search_newlist_topmain1.fl a").each(function (i, e) {
                                params = querystring.parse($(e).attr("href"));
                                fjtDic[$(e).text()] = params["fjt"];
                            });
                            result["职位标签"] = fjtDic;
                            debug('职位标签: %O', fjtDic);
                            break;
                        case "更多条件搜索":
                            var Dic = {}, params, li, a, atext, ptext, key;
                            $(e).next().find("li").each(function (i, e) {
                                li = $(e);
                                ptext = li.find("p").text();
                                if (!_.has(Dic, ptext)) Dic[ptext] = {};
                                key = null;
                                li.find("a").each(function (i, e) {
                                    a = $(e);
                                    atext = a.text();
                                    params = querystring.parse(a.attr("href"));
                                    switch (ptext) {
                                        case "薪资":
                                            Dic[ptext][atext] = _.pick(params, "sf", "st");
                                            break;
                                        default:
                                            if (!key)
                                                key = _.last(_.keys(params));
                                            Dic[ptext][atext] = _.pick(params, key);
                                            break;
                                    }
                                });
                            });
                            _.extend(result, Dic);
                            debug('更多条件搜索: %O', Dic);
                        default:
                            break;
                    }
                }
            });
            resolve(result);
        })

    });

}

module.exports = {
    "getDataPromise": getPagesJson
}