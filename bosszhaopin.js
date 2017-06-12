var request = require('superagent'),
	async = require('async'),
	cheerio = require("cheerio");

function getPromise(pagenum = 3, retrytime = 3) {

	return new Promise(function(resolve, reject) {
		var _result = [];
		async.times(pagenum, function(n, nextPage) {
			console.log('getDataaCCCC' + n);
			async.retry(retrytime, function(retry) {

				request.get(`https://www.zhipin.com/c100010000/h_101010100/?query=Node.js&page=${n+1}&ka=page-${n+1}`).end(function(err, res) {
					if (err) {
						retry(err);
						return;
					}
					var $ = cheerio.load(res.text);
					$(".job-list ul li").each(function(i, e) {
						var jobprimary = $(e).find(".job-primary"),
							infocompany = $(e).find(".info-company"),
							infoprimaryp = jobprimary.find(".info-primary p").contents().toArray().filter(item => {
								return item.type == "text";
							}),
							companytextp = infocompany.find(".company-text p").contents().toArray().filter(item => {
								return item.type == "text";
							});

						_result.push({
							"positionName": jobprimary.find(".info-primary .name").contents()[0].data,
							"salary": jobprimary.find(".info-primary .red").text(),
							"city": infoprimaryp[0].data,
							"workYear": infoprimaryp[1].data,
							"education": infoprimaryp[2].data,
							"company": infocompany.find(".company-text .name").text(),
							"industryField": companytextp[0].data,
							"financeStage": companytextp.length == 2 ? "" : companytextp[1].data,
							"companySize": companytextp[companytextp.length - 1].data
						});

					});
					retry(null);
				});


			}, function(err, result) {
				if (err) {
					nextPage(err);
					return;
				}
				nextPage(null);
			});

		}, function(err, results) {
			if (err) {
				reject(err);
				return;
			}
			resolve(_result);
		});

	});
}

module.exports = {
	"getDataPromise": getPromise
}