var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');

var textToSpeech = new TextToSpeechV1({
    iam_apikey: 'h-hhJqRfBjwm88hqEphAxNv9E2cuscmzOI4HrRsFOHL0',
    url: 'https://gateway-syd.watsonplatform.net/text-to-speech/api'
});

var synthesizeParams = {
  text: 'You have a new message.',
  accept: 'audio/wav',
  voice: 'en-US_AllisonVoice'
};

textToSpeech.synthesize(synthesizeParams, function(err, response) {
	if (err) {
		console.log('--textToSpeech error:', err);
	} else {
		var fileWriteStream = fs.createWriteStream('tts-en.wav');
		fileWriteStream.write(response);
		fileWriteStream.end();
		console.log('--textToSpeech:done');
	}
});