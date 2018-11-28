var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var fs = require('fs');

var speechToText = new SpeechToTextV1({
    iam_apikey: 'EMy2S5VYrtghrX2_gq_1gpkj3MebcW0Ys-DEh81IgPBH',
    url: 'https://gateway-syd.watsonplatform.net/speech-to-text/api',
	headers: {'X-Watson-Learning-Opt-Out': 'true'}
});

var params = {
    objectMode: true,
    'content_type': 'audio/wav',
    model: 'en-US_BroadbandModel',
    keywords: ['colorado', 'tornado', 'tornadoes'],
    'keywords_threshold': 0.5,
    'max_alternatives': 3
};

// Create the stream.
var recognizeStream = speechToText.recognizeUsingWebSocket(params);

// Pipe in the audio.
fs.createReadStream('tts-en.wav').pipe(recognizeStream);

// Listen for events.
recognizeStream.on('data', function(event) { onEvent('Data:', event); });
recognizeStream.on('error', function(event) { onEvent('Error:', event); });
recognizeStream.on('close', function(event) { onEvent('Close:', event); });

// Display events on the console.
function onEvent(name, event) {
	
	//callback(event.results[0].alternatives[0].transcript);
	console.log(name, JSON.stringify(event, null, 2));

    
};
