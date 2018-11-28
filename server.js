var async = require("async");
var http = require('http');
var url = require('url');
var util = require('util');
var fs = require("fs");

var watson = require('./watson.js');
var googleTran = require('./translate.js');

var request = require('request');
global.context = {};
global.user = {};

var workspace_id_en = '4566257c-8118-4659-b02d-f42d469bc882';
var workspace_id_zh = 'b43cfedb-e889-4d13-8fbd-b62ce54dcff9';

var server = http.createServer(function(req, res){
	// crossDomain
	if (req.method === 'OPTIONS') {
		var headers = {};
		//headers["Access-Control-Allow-Origin"] = "*";
		headers["Access-Control-Allow-Origin"] = req.header("Origin");
		headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
		headers["Access-Control-Allow-Credentials"] = false;
		headers["Access-Control-Max-Age"] = '86400'; // 24 hours
		headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
		res.writeHead(200, headers);
		res.end();
	} else {
		var headers = {};
		headers["Access-Control-Allow-Credentials"] = true;
		headers["Access-Control-Allow-Origin"] = "*";
		headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE";
		headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
		headers["Content-Type"] = "application/json;charset=utf-8";
		res.writeHead(200, headers);
	}
	
	res.write(JSON.stringify("Welcome to JAL Garage"));
	res.end();
	
    // 解析 url 参数
	var params = url.parse(req.url, true).query;
	
	// login画面用
	if (params.page === 'login'){
		// user info
		global.context = {};
		global.user = {};
		var data = fs.readFileSync('user.json');
		
		if (params.lang === 'zh'){
			data = fs.readFileSync('user-zh.json');
		}
		global.user = JSON.parse(data.toString())["user"];
		console.log(`${user.name} --login--`);
		res.write(data.toString());
		res.end();
	}
	
	// 消息通知画面用
	if (params.page === 'notification'){
		
		// notification list(English)
		var data = fs.readFileSync('notification.json');
		var resText = {};
		if (params.lang === 'zh'){
			// translate content
			resText = JSON.parse(data);
			
			var task = [];
			resText['notifications'].forEach(function(item){
				
				// translate the content of each notification from English to Chinese
				task.push(function(callback){
					googleTran.translate(item.content, "en", "zh-cn", function(response, body){
						item.content = body.toString();
						//console.log(item.content);
						callback(null, body);
					})
				});
			});
			
			async.parallel(task, function(err, results){
				console.log('---Notifications have been transalated from English to Chinese--');
				res.write(JSON.stringify(resText));
				res.end();
			});
			
		} else {
			console.log('---Notifications return--');
			res.write(data.toString());
			res.end();
		}
		
	}
	
	// 谷歌翻译service
	if (params.page === 'translate'){
		// transalate
		var textEncode = params.text;
		console.log('---google translate start--');
		googleTran.translate(textEncode, params.source, params.target, function(response, body){
			console.log('---google translate have been executed--');
			res.write(body.toString());
			res.end();
		})
	}
	
	// 聊天用
	//var context = {};
	if (params.page === 'chat'){
		console.log('---conversation start--');
		// default English
		var workspace_id = workspace_id_en;
		if (params.lang === 'zh'){
			workspace_id = workspace_id_zh;
		}
		// conversation
		var body = {"version":"v1"};
		watson.message(params.text, global.context, workspace_id, function(err, response) {
		  if (err){
			body["error"] = err;
			console.log('error:', err);
		  }else{
			body["reply"] = [];
			var type = response['context']['type'];
			// chat init
			if(type === 0) {
				var reply = {
					type:1,
					chat:[
					{text:"Welecome, " + user.name + ". Thank you for taking the JAL flight."},
					{text:"I am Gaka, your smart travel assistant. Here are what I can do for you. Wish you a convenient and enjoyable trip!",
					recommend:[
						{title:'1, Smart Chat'},
						{title:'2, Navigation/Map'},
						{title:'3, Entertainment'},
						{title:'4, Notification'},
						{title:'5, Weather'},
						{title:'6, Online Shopping'}]
					},
					{text:"Your flight information:",
					recommend:[
						{title: "・Flight Number: " + user.flightNumber},
						{title: "・Scheduled Boarding Time: " + user.aboardTime},
						{title: "・Gate No.: " + user.gate},
						{title: "90 minutes from boarding. You have a lot of time, how about going around?"},
						{title: "Call me whenever you have any questions or wherever you want to go."}]
					}]
				};
				
				if (params.lang === 'zh'){
					reply = {
						type:1,
						chat:[
						{text:user.name + "女士，您好！感谢乘坐JAL航班。"},
						{text:"我是Gaka，我很聪明能干，我能提供以下服务，希望能够使您的旅程更加便利和愉快！",
						recommend:[
							{title:'1,智能聊天'},
							{title:'2,导航'}, 
							{title:'3,娱乐'},
							{title:'4,通知'}, 
							{title:'5,天气预报'},
							{title:'6,网上购物'}]
						},
						{text:"您本次乘坐的航班相关信息如下所示：",
						recommend:[
							{title: "・航班号： " + user.flightNumber},
							{title: "・预计登机时间： " + user.aboardTime},
							{title: "・登机口： " + user.gate},
							{title: "距离登机只有30分钟了, 请问您现在想去登机吗？"},
							{title: "是", img:"#"},
							{title: "否", img:"#"}]
						}]
					};
				};
				
			}else if(type === 1) {
				var recommendObj = [];
				// actions need by response action 
				if (response['context']['action']){
					if (response['context']['action'] === 'getRecommendShopType'){
						recommendObj = [
						{title:'Coffee Shop', img:"#"},
						{title:'Book Store', img:"#"}, 
						{title:'Restaurant', img:"#"},
						{title:'Shopping', img:"#"}];
					}
				}
				
				var reply = {
					type:1,
					chat:[{
						text:response["output"]["text"].toString(),
						recommend:recommendObj
					}]
				};
			}else if(type === 2) {
				var shopsData = {};
				if (response['context']['action'] === 'getShopList'){
					var data = fs.readFileSync('shop-en.json');
					shopsData = JSON.parse(data.toString(), null, 2);
				}
				
				//console.log(shopsData['shops']);
				
				var reply = {
					type:2,
					chat:[{
						text:response["output"]["text"].toString()
					}],
					shops: shopsData['shops']
				};
			}else if(type === 3) {
				var reply = {
					type:3,
					target:response['context']['target'],
					chat:[{
						text:response["output"]["text"].toString()
					}]
				};
			}
			//conversation_res = JSON.stringify(response, null, 2);
			global.context = response['context'];
			body["reply"].push(reply);
		  }
		  console.log('---conversation responsed--');
		  res.write(JSON.stringify(body));
		  res.end();
		});	
    }
 
});

var serverPort = process.env.PORT || 5000;
server.listen(serverPort);

// session time out
setInterval(function () {
      global.context = {};
}, 3600000)

// log output
console.log(`Server running at http://127.0.0.1:${serverPort}/`);