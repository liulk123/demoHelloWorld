var http = require('http');
var querystring = require('querystring');
var request = require('request');
//Google translate API
var url = "https://script.google.com/macros/s/AKfycbzbsmPKDGIji0upbf2buf4nGowtjVSIxGPNGUqdfnoUe3d8JtM/exec";

exports.translate = function(text, source, target, callback) {
    var tranURL = url + "?text=" + text + "&source=" + source + "&target=" + target;
    
    request(tranURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(response, body);
			//console.log(body);
		}
	})
}


