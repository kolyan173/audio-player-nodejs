var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
var request = require('request');
var wordsfile = fs.createWriteStream('./combined-words.mp3');
var url = 'http:\//translate.google.com/translate_tts?ie=UTF-8&q=motherfucker&tl=en';
var words = ['pussy', 'horse'];

function wordUrl(word) {
	return 'http:\//translate.google.com/translate_tts?ie=UTF-8&' + 
		'q=' + word + '&tl=en';
}

function getStreamWord(word) {
	return request.get(wordUrl(word))
		.on('response', function(stream) {
			return stream/*.pipe(new lame.Decoder())
				.on('format', function (format) {
					this.pipe(new Speaker(format));
				})*/
		});	
}

function main() {
	var stream;
    if (!words.length) {
        return wordsfile.end("Done");
    }
    
    stream = getStreamWord(words.shift());
    stream.pipe(wordsfile, {end: false});
    stream.on("end", function() {
        console.log('File appended');
        main();        
    });
}
main();