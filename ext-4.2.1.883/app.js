var http=require('http');
var fs=require('fs');
var url=require('url');
var path=require('path');
var querystring = require('querystring');
var util = require('util');

var MIME_TYPE = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};

var port=9080;

http.createServer(function(req,res){


	
	switch (req.method.toUpperCase())
	{
		case 'GET':
		       var filePath="index.html" ;
				req.url!="/"&&(filePath =__dirname + url.parse(req.url).pathname);

				console.log("Server runing at port: " + filePath + ".");

				fs.exists(filePath,function(err){
					if(!err){

						res.writeHead(404, {"Content-Type": "text/plain;charset=utf-8"});
						res.write('This requst URL ' + filePath + ' was not found on this server.');
						res.end();
						return;

					}else{
						var ext = path.extname(filePath);
						ext = ext?ext.slice(1) : 'unknown';
						var contentType = MIME_TYPE[ext] || "text/plain;charset=utf-8";
						// res.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
						//res.writeHead(200,{'content-type':contentType});
						var s=fs.createReadStream(filePath);
						s.on('open', function () {
							res.setHeader('Content-Type', contentType);
							s.pipe(res);
						});
						s.on('error', function () {
							res.setHeader('Content-Type', 'text/plain');
							res.statusCode = 404;
							res.end('Not found');
						});

	
					}
			});

			break;
		case 'POST':
			var postData="";
			req.addListener("data", function (data) {
                postData += data;
            });

            req.addListener("end", function () {
				
                var query = querystring.parse(postData);
				//$.post("http://localhost:9090/",{name:"sdfds","sdfds":"ddd"},function(result){console.dir(result);});
				//res.write(JSON.stringify(query));
				//console.dir(JSON.parse(postData)["name"]);
				console.dir(query);
				res.write(JSON.stringify({"success":true}));
				res.end();
            });
			 
			break;
	
	} 


	


}).listen(port)


console.log("Server runing at port: " + port + ".");


/*
var express = require("express");
var app = express();
app.use("/",express.static(__dirname + "/public"));
app.listen(3000);

*/