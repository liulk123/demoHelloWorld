var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var assistant = new AssistantV1({
    username: '0686a337-32b2-4a80-a562-354234f7418d',
    password: 'j4kn6j5qmwos',
    version: '2018-07-10',
    url: 'https://gateway.watsonplatform.net/assistant/api'
});

exports.message = function(text, context, workspace_id, callback) {
    var payload = {
        workspace_id: workspace_id,
        input: {
          text: text
        },
        context: context
    };
    // console.log('message:', JSON.stringify(payload, null, 2));
    assistant.message(payload, function(err, response) {
        callback(err, response);
    })
}

