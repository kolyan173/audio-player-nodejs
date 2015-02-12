var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
var request = require('request');
var url = 'http:\//translate.google.com/translate_tts?ie=UTF-8&q=motherfucker&tl=en';

request
	.get(url)
	.on('response', function(res) {
		res.pipe(new lame.Decoder())
		.on('format', function (format) {
			this.pipe(new Speaker(format));
		})
	});