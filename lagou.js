var request = require('superagent'),
	async = require('async'),
	urlencode = require('urlencode'),
	path = require('path'),
	fs = require('fs'),
	co = require('co');

var getUrl = function(page, city = "全国", kd = "node.js") {
	return `https://www.lagou.com/jobs/positionAjax.json?px=default&needAddtionalResult=false&
	city=${urlencode(city)}&first=${page==1?true:false}&kd=${urlencode(kd)}&pn=${page}`;
}

function getPromise(pagenum = 3, retrytime = 3) {

	return new Promise(function(resolve, reject) {


		var getP = function(page) {
			return new Promise(function(resolve, reject) {

				async.retry(retrytime, function(retry) {

					request.post(getUrl(page)).set({
							'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'Accept-Encoding': 'gzip, deflate, br',
							'Host': 'www.lagou.com',
							'Origin': 'http://www.lagou.com',
							'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
							'Referer': 'http://www.lagou.com',
							'Proxy-Connection': 'keep-alive',
							'X-Anit-Forge-Code': '0',
							'X-Anit-Forge-Token': "None",
							'X-Requested-With': 'XMLHttpRequest'
						})
						.end(function(err, res) {
							if (err) {
								retry(err);
								return;
							}
							var result = JSON.parse(res.text);
							retry(null, result.content.positionResult.result);
						});

				}, function(err, result) {
					if (err) {
						reject(err);
						return;
					}
					resolve(result);
				});
			});

		};

		/*
		 var result = {
		 "createTime": "2017-06-12 20:45:44",
		 "companyId": 5706,
		 "positionName": "Node.js",
		 "workYear": "3-5年",
		 "education": "不限",
		 "jobNature": "全职",
		 "companyShortName": "洋葱数学",
		 "city": "北京",
		 "salary": "20k-40k",
		 "financeStage": "成长型(B轮)",
		 "positionId": 316311,
		 "companyLogo": "i/image/M00/01/FA/Cgp3O1Z9BXWALko8AACyUeZ468w175.png",
		 "positionAdvantage": "丰厚期权、超长年假、年度体检、免费早午餐",
		 "approve": 1,
		 "industryField": "移动互联网,教育",
		 "district": "西城区",
		 "score": 0,
		 "companyLabelList": ["产品领先行业", "关注学习本源", "明星跨界团队", "股票期权"],
		 "positionLables": ["教育"],
		 "industryLables": ["教育"],
		 "companySize": "50-150人",
		 "imState": "today",
		 "businessZones": ["虎坊桥", "大栅栏", "前门"],
		 "lastLogin": 1497270283000,
		 "publisherId": 57680,
		 "explain": null,
		 "plus": null,
		 "pcShow": 0,
		 "appShow": 0,
		 "deliver": 0,
		 "gradeDescription": null,
		 "promotionScoreExplain": null,
		 "firstType": "技术",
		 "secondType": "后端开发",
		 "formatCreateTime": "1天前发布",
		 "companyFullName": "光合新知（北京）科技有限公司",
		 "adWord": 0
		 };  */

		co(function*() {
			var _pagenum = 0,
				result = [];
			while ((_pagenum++) < pagenum) {
				result = result.concat(yield getP(_pagenum));
			}
			return result;
		}).then(function(result) {
			resolve(result);
		}, function(err) {
			reject(err);
		});



	});


}


function getDownPhotoPromise(pagenum = 3) {

	return new Promise(function(resolve, reject) {

		var imgDir = path.join(__dirname, "imgs");
		async.auto({
				makeImgDir: function(callback) {

					fs.exists(imgDir, (exists) => {
						if (!exists) {
							fs.mkdir(imgDir, function(err) {
								if (err) {
									callback(err);
									return;
								}
								callback(null);
							})
							return;
						}
						callback(null);
					});
				},
				getData: function(callback) {
					console.log('getData');
					getPromise(pagenum).then(function(value) {
						callback(null, value);
					}).catch(function(reason) {
						callback(reason);
					});
				},
				savePhoto: ['makeImgDir', 'getData', function(results, callback) {
					//下载公司logo
					async.eachLimit(results["getData"], 5, function(item, next) {
						var imgurl = item.companyLogo,
							imgpath = "no",
							companyShortName;
						//"i/image/M00/1F/43/CgpFT1kRms6ALcwgAAAVva3NK58840.jpg"  "image1/M00/3F/D5/CgYXBlXBtseABpXHAAAOGSmg5jM209.gif?cc=0.6404429662507027"
						/([^\/]*\.(jpg|gif|png))/.test(imgurl) && (imgpath = RegExp.$1);
						console.log(imgpath);
						//path.posix.basename(imgurl)
						request.get('https://www.lgstatic.com/thumbnail_120x120/' + imgurl).pipe(fs.createWriteStream(path.join(imgDir, imgpath))).on('close', function() {
							console.log('pic saved!')
							next(null);
						}).on('error', function(err) {
							next(null);
						});

					}, function(err) {
						if (err) {
							callback(err);
							return;
						}
						callback(null);
					});
				}]
			},
			function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				resolve(true);
			});

	});
}



module.exports = {
	"getDataPromise": getPromise,
	"getDownPhotoPromise": getDownPhotoPromise
}