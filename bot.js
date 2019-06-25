const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const config = require('./config.js');

const axios = require('axios');
//const bodyParser = require('body-parser');

// Initialize Discord Bot
const bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
	//console.log(bot)
	if(user !== 'getPet'){
		axios.post('https://api.dialogflow.com/v1/query?v=20150910',
		{  contexts: ["shop"],
			 lang: "fr",
			 query: message + ' ' + user,
			 sessionId: "f04e1bf8-18aa-4ab7-8832-58059591101e",
			 timezone: "America/New_York"
		},
		{ headers: { 'Content-Type' : 'application/json', Authorization: "Bearer " + config.Dialogflow },
		}).then(function(res){
			try {
				console.log(res.data.result.fulfillment.speech)
				console.log(bot.channels[channelID])
				//bot.channel.startTyping();
				bot.sendMessage({
						to: channelID,
						message: res.data.result.fulfillment.speech
				});
				//bot.stopTyping();
			}
			catch(error){
				console.log(error)
			}
		});
	}
});
