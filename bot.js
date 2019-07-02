const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const config = require('./config.js');

const axios = require('axios');

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

let talk = "off";
let askAdopt = false;
let validAdopt = false;
let botSay = '';
let embed = null;

bot.on('message', function (user, userID, channelID, message, evt) {
	if(user !== 'getPet'){
		// turn on bot
		if(message=='pet talk' && talk=="off"){
			talk = "on";
			botSend(bot, channelID, dialogFlow('start : ' + user));
		}
		// turn off bot
		else if(message=='pet talk' && talk=="on"){
			talk = "off";
			botSend(bot, channelID, dialogFlow('exit : ' + user));
		}
		// bot on
		else if(talk=="on"){
			// askAdopt == true
			if(askAdopt) {
				if(message=="chat"){
					// get cat
					validAdopt = true;
					askAdopt = false;
					let catStatus = randomStatus();
					setEmbed({url:'https://http.cat/'+catStatus});
					botSend(bot, channelID, dialogFlow("showAdopt : chat"));
				}
				else if(message=="chien"){
					// get dog
					validAdopt = true;
					askAdopt = false;
					axios.get('https://dog.ceo/api/breeds/image/random',
					{ headers: { 'Content-Type' : 'application/json' },
					}).then(function(res){
						try {
							setEmbed({url:res.data.message});
							botSend(bot, channelID, dialogFlow("showAdopt : chien"));
						}
						catch(error){ botSend(bot, channelID, error); }
					});
				}
				else botSend(bot, channelID, dialogFlow("error : animal undefined"));
			}
			// validAdopt == true
			else if(validAdopt) {
				if(message=="oui"){
					validAdopt = false;
					botSend(bot, channelID, dialogFlow("validAdopt : true"));
				}
				else if(message=="non"){
					validAdopt = false;
					botSend(bot, channelID, dialogFlow("validAdopt : false"));
				}
				else botSend(bot, channelID, dialogFlow("validAdopt : undefined"));
			}
			else botSend(bot, channelID, dialogFlow(message));
		}
	}
});

function dialogFlow(message){
	axios.post('https://api.dialogflow.com/v1/query?v=20150910',
	{  contexts: [],
		 lang: "fr",
		 query: message,
		 sessionId: "f04e1bf8-18aa-4ab7-8832-58059591101e",
		 timezone: "America/New_York"
	},
	{ headers: { 'Content-Type' : 'application/json', Authorization: "Bearer " + config.Dialogflow },
	}).then(function(res){
		try {
			let data = res.data.result.fulfillment.speech.split(':');
			if(data[0]=="askAdopt"){
				setEmbed();
				askAdopt = true;
			}
			else if(data[0]=="showAdopt") {

			}
			return data[1];
		}
		catch(error){ return error }
	});
}

function botSend(bot, channelID, message){
	bot.sendMessage({
		to: channelID,
		message: message,
		embed: { embed },
		typing: true
	});
	return;
}

function randomStatus(){
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
	return catStatus[0];
}

function setEmbed(){
	embed = {
		color: 6826080,
		footer: {
			text: ''
		},
		thumbnail:
		{
			url: ['https://http.cat/200']
		},
		title: '',
		url: '',
		fields: [
			{
				"name": "Chien",
				"value": "Hi! :wave:",
				"inline": true
			},
			{
				"name": "Chat",
				"value": ":smile:",
				"inline": true
			}
		]
	}
}
