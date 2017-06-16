var request = require('superagent'),
    async = require('async'),
    cheerio = require("cheerio"),
    urlencode = require('urlencode'),
    querystring = require("querystring"),
    _ = require("underscore"),
    fs = require('mz/fs'),
    debug = require('debug')('spider:zhaopin'),
    path = require('path'),
    { URLSearchParams } = require('url');

var bosszhipin = require('./bosszhaopin');
//set debug=spider:*  set debug=null
/* 
thenifyAll = require('thenify-all'),
fs = thenifyAll(require('fs'), {}, [
    'readFile',
    'writeFile'
]);*/

var _baseurl = "http://sou.zhaopin.com/jobs/searchresult.ashx?jl=" + urlencode("北京+上海+深圳+广州") + "&kw=nodejs&isadv=0&p=3";
var config_json = "zhaoping_cofig.json";
var _cjson = null;
var init = async function () {
    debug("_cjson:%O", _cjson);
    if (_cjson && _.has(_cjson, "薪资")) return;
    var savepath = path.join(__dirname, config_json), _json;
    if (await fs.exists(savepath)) _json = JSON.parse(await fs.readFile(savepath, { encoding: 'utf-8' }));
    else {
        _json = await getConfigJson(_baseurl);
        await fs.writeFile(savepath, JSON.stringify(_json, null, 4), 'utf8');
    }
    _cjson = _json;
    debug("_cjson:%O", _cjson);
}


var getUrl = async function (conf) {
    //参照zhanping_cofig.json
    var config = {
        "page": 1,
        "城市": "全国",//北京+上海+深圳+广州
        "薪资": "不限",
        "公司性质": "不限",
        "学历": "不限",
        "工作经验": "不限",
        "职位类型": "不限",
        "发布时间": "不限"
    }
    _.extend(config, conf || {});

    await init();
    var params = new URLSearchParams();
    for (key in config) {
        switch (key) {
            case "page":
                params.append('p', config[key]);
                break;
            case "薪资":
                _.each(_cjson[key][config[key]], function (value, key, list) {
                    params.append(key, value);
                })
                break;
            case "城市":
                params.append("jl", urlencode(config[key]));
                break;
            default:
                var k = _.keys(_cjson[key][config[key]])[0];
                console.log(k);
                params.append(k, _cjson[key][config[key]][k]);
                break;
        }
    }
    return `http://sou.zhaopin.com/jobs/searchresult.ashx?kw=nodejs&isadv=0&${params.toString()}`;
}

//招聘信息有点少，3页以后没数据
var getPagesJson = function () {
    var result = [];
    return new Promise((resolve, reject) => {
        (async () => {
            var page = 1, data, url;
            while (true) {
                url = await getUrl({ "page": page });
                debug('url: %s', url);
                data = await getPageJson(url);
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

var getPageJson = function (url) {

    return new Promise((resolve, reject) => {
        request.get(url).end(function (err, res) {
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


var getConfigJson = function (url) {
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