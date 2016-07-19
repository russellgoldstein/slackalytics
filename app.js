//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');

var chatting = false;
var lastChat = new Date();
var lastSend = new Date();
var numMessages = 0;

//set up heroku environment variables
var env_var = {
	ga_key: process.env.GOOGLE_ANALYTICS_UAID
};

//Server Details
var app = express();
var port = process.env.PORT || 3000;

//Set Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));


//Routes
app.get('/', function(req, res){
	res.send('here');
});

app.post('/collect', function(req, res){
	chatting = true;
	if((new Date()/1000) - (lastChat.getTime()/1000) < 5){
		console.log("new chat less than 5 seconds, now at " + numMessages);
		numMessages++;
		
		if(numMessages > 5 && ((new Date()/1000) - (lastSend.getTime()/1000) > 120)){
			numMessages = 0;
			//Make Post Request
			console.log("new chatter, sending post request");
			request({
				url:'https://hooks.slack.com/services/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',
				method: 'POST',
				json: {"text": "<!everyone> we got a lot of chatter going on!"}
				
			}, function(error, response, body){
			    if(error) {
			        console.log(error);
			    } else {
			        console.log(response.statusCode, body);
			}
			});
			lastSend = new Date();
		}
	}else{
		console.log("new chat greater than 5 seconds");
		numMessages = 0;
	}
	lastChat = new Date();
	var channel = {
		id: 	req.body.channel_id,
		name: 	req.body.channel_name
	};
	var user = {
		id: 	req.body.user_id
	};
	var msgText = req.body.text;
	var teamDomain = req.body.team_domain;


	function searchM(regex){
		var searchStr = msgText.match(regex);
		if(searchStr != null){
			return searchStr.length;
		}
		return 0;
	};

	function searchS(regex){
		var searchStr = msgText.split(regex);
		if(searchStr != undefined){
			return searchStr.length;
		}
		return 0;
	};


	var wordCount = searchS(/\s+\b/);
	var emojiCount = searchM(/:[a-z_0-9]*:/g);
	var exclaCount = searchM(/!/g);
	var questionMark = searchM(/\?/g);
	var elipseCount = searchM(/\.\.\./g);

	console.log(req.body);
	
	res.send("OK")
});

//Start Server
app.listen(port, function () {
	console.log('Listening on port ' + port); 
});
