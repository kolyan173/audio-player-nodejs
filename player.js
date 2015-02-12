var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
var request = require('request');
var radio = require('radio-stream');
var url = 'http:\//translate.google.com/translate_tts?ie=UTF-8&q=motherfucker&tl=en';
var stream = radio.createReadStream(url);
// request(url, function (error, res, body) {
//   if (!error && res.statusCode == 200) {
// // fs.createReadStream(process.argv[2])

// 	fs.createReadStream(url)
// 	stream
// 	.on('data', function(res) {
// 		res.pipe(new lame.Decoder())
// 		.on('format', function (format) {
// 			this.pipe(new Speaker(format));
// 		});
//   // }
// });

request
	.get(url)
	.on('response', function(res) {
			// fs.createReadStream(res)
				res.pipe(new lame.Decoder())
				.on('format', function (format) {
					this.pipe(new Speaker(format));
				})
	});