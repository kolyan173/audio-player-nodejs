var fs = require('fs'),
	lame = require('lame'),
	Speaker = require('speaker'),
	request = require('request'),
	Promise = require('promise'),
	needle = require('needle'),
	Q = require('q'),
	rp = require('request-promise'),
	CombinedStream = require('combined-stream'),
	 _ = require('lodash');

var wordsfile = fs.createWriteStream('./combined-words.mp3');

var getAttributes = _.memoize(function () {
	var attributes = process.argv;
	return {
		word: (~attributes.indexOf('word') ? attributes[ attributes.indexOf('word')+1 ] : null) 
				|| 'nothing was entered',
		play: !!~attributes.indexOf('PLAY')
	};
});

function Generator() {};

Generator.prototype = {
	// words: attributes.slice(2) || ['nothing was entered'],
	words: [ getAttributes().word ],

	wordAudio: function(word, language) {
		var res = 'http:\//translate.google.com/translate_tts?ie=UTF-8&' + 
			'q=' + (word || this.words[0]) + '&tl=' + (language || 'en') ;
		// console.log(res);
		return res;
	},
	translate: function(sourceText, sourceLang, targetLang) {
		return 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
			(sourceLang || 'en') + '&tl=' + (targetLang || 'ru') + '&dt=t&q=' + (sourceText || 'word to translate');
	},
	getTranslatedWord: function() {
		return rp(this.translate(getAttributes().word))
			.then(function(body) {
				return JSON.parse(body.replace(/,,/g, ','))[0][0][0];
			});
	},
	getStreamWord: function(play, word, language) {
		var word = word || '';
		var deferred = Q.defer();
		request.get( this.wordAudio(word, language) )
			.on('response', function(stream) {
				deferred.resolve(stream.pipe(new lame.Decoder()));
				// return !play && 'stream' || stream.pipe(new lame.Decoder())
				// 	.on('format', function (format) {
				// 		this.pipe(new Speaker(format));
				// 	});
			});	
		return deferred.promise;
	},
	buildPaire: function() {
		// var stream = this.getStreamWord(getAttributes().play);
		return this.getStreamWord(getAttributes().play)
			.then(function(stream) {
				stream.on('format', function (format) {
					this.pipe(new Speaker(format));
				});
				return 
			}.bind(this))
			.then(function(stream2) {

			});
		return Promise.all([
				this.getTranslatedWord(),
				this.getStreamWord(getAttributes().play)
			]).then(function(res) {
				console.log(res);
				res[1].on('format', function (format) {
						this.pipe(new Speaker(format));
					});
				var stream2 = this.getStreamWord(getAttributes().play, res[0], 'ru');
				return [res[0], stream2]; 
			}.bind(this)).then(function(res) {
				// var combinedStream = CombinedStream.create();
				var combinedStream = res[0];
				
				// combinedStream.append(res[0]);
				// combinedStream.append(res[1]);

				return combinedStream/*2*/
					.on('format', function (format) {
						this.pipe(new Speaker(format));
					});
			}.bind(this));
			// request.get( this.wordAudio('тест'/*this.getTranslatedWord(), 'ru') );
		
	},
	generate: function() {
		if (!this.words.length) {
			return wordsfile.end("Done");
		}
		var stream;

		stream = this.getStreamWord(this.words.shift(), getAttributes().play);
		stream.pipe(wordsfile, {end: false});
		stream.on("end", function() {
			console.log('File appended');
			this.generate();        
		}.bind(this));
	}
}

var myGenerator = new Generator();

// myGenerator.getTranslatedWord();
myGenerator.buildPaire();
// myGenerator.getStreamWord(true);

