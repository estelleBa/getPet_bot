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

				if(res.data.result.fulfillment.speech=='dog'){
					// GET DOG FROM API
					axios.get('https://dog.ceo/api/breeds/image/random',
					{ headers: { 'Content-Type' : 'application/json' },
					}).then(function(res){
						try {
							bot.sendMessage({
									to: channelID,
									message: res.data.message
							});
						}
						catch(error){
							console.log(error)
						}
					});
				}
				else if(res.data.result.fulfillment.speech=='cat'){
					let catStatus = [200,202,206,300,302,307,400,401,402,403,404,406,408,415,418,420,425,500,502,599];
					function shuffle(a) {
					    var j, x, i;
					    for(i=0; i < catStatus.length; i++) {
					        j = Math.floor(Math.random() * (i));
					        x = a[i];
					        a[i] = a[j];
					        a[j] = x;
					    }
					    return a;
					}
					catStatus = shuffle(catStatus);
					try {
						bot.sendMessage({
								to: channelID,
								message: 'https://http.cat/'+catStatus[0]
						});
					}
					catch(error){
						console.log(error)
					}
				}
				else {
					//bot.channel.startTyping();
					bot.sendMessage({
							to: channelID,
							message: res.data.result.fulfillment.speech
					});
					//bot.stopTyping();
				}
			}
			catch(error){
				console.log(error)
			}
		});
	}
});
