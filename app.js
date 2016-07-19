//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');
var util = require('util');

var channels = {};

//set up heroku environment variables
var env_var = {
	
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
	
	var channel = {
		id: 	req.body.channel_id,
		name: 	req.body.channel_name
	};
	var user = {
		id: 	req.body.user_id,
		name:	req.body.user_name
	};
	
	var channelObj = channels[channel.name];
	if(channelObj == null){
		channelObj = {lastChat: new Date(), lastSend: new Date(), numMessages: 0, users: [user.name], usersHash:{}};
		channelObj.usersHash[user.name] = user.name;
	}else if(channelObj.users[channelObj.users.length-1] == user.name){
		// only add new user if the last message wasn't from the same user
		console.log("user " + user.name + " sending consecutive messages...skipping");
		return;
	}else{
		channelObj.users.push(user.name);
		channelObj.usersHash[user.name] = user.name;
	}
	
	if((new Date()/1000) - (channelObj.lastChat.getTime()/1000) < 20){
		channelObj.numMessages = channelObj.numMessages + 1;
		console.log("new chat less than 5 seconds, now at " + channelObj.numMessages);
		
		if(channelObj.numMessages > 5 && ((new Date()/1000) - (channelObj.lastSend.getTime()/1000) > 120)){
			channelObj.numMessages = 0;
			//Make Post Request
			console.log("new chatter, sending post request");
			var users = "";
			for(user in channelObj.usersHash){
				users += usersHash[user] +", ";
			}
			users = users.substring(0, users.length-2);
			request({
				url:'https://hooks.slack.com/services/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',
				method: 'POST',
				json: {"text": "<!channel> we got a lot of chatter going on here from " + users}
				
			}, function(error, response, body){
			    if(error) {
			        console.log(error);
			    } else {
			        console.log(response.statusCode, body);
			}
			});
			channelObj.lastSend = new Date();
		}
	}else{
		console.log("new chat greater than 5 seconds");
		channelObj.numMessages = 0;
		channelObj.users = [];
	}
	channelObj.lastChat = new Date();
	
	channels[channel.id] = channelObj;
	
	console.log(util.inspect(channels, {showHidden: false, depth: null}));

	console.log(req.body);
	
	res.send("OK")
});

//Start Server
app.listen(port, function () {
	console.log('Listening on port ' + port); 
});
