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
let chooseName = false;
let embed = false;

let botSay = '';
let user = 0;
let params;

bot.on('message', function (user, userID, channelID, message, evt) {
	if(user !== 'getPet'){
		// turn on bot
		if(message=='pet talk' && talk=="off"){
			talk = "on";
			dialogFlow(bot, channelID, 'start = ' + user);
		}
		// turn off bot
		else if(message=='pet talk' && talk=="on"){
			talk = "off";
      askAdopt = false;
      validAdopt = false;
      chooseName = false;
			dialogFlow(bot, channelID, 'exit = ' + user);
		}
		// bot on
		else if(talk=="on"){
			// askAdopt == true
			if(askAdopt) {
        if(!validAdopt){
          // split indexof chat !== -1
          let splitText = message.split(' ');
  				if(splitText.indexOf('chat', 0) !== -1){
  					// get cat
  					validAdopt = true;
  					let catStatus = randomStatus();
  					dialogFlow(bot, channelID, "showAdopt = chat", 'https://http.cat/'+catStatus);
  				}
  				else if(splitText.indexOf('chien', 0) !== -1){
  					// get dog
  					validAdopt = true;
  					axios.get('https://dog.ceo/api/breeds/image/random',
  					{ headers: { 'Content-Type' : 'application/json' },
  					}).then(function(res){
  						try {
  							dialogFlow(bot, channelID, "showAdopt = chien", res.data.message);
  						}
  						catch(error){ console.log(error) }
  					});
  				}
  				else dialogFlow(bot, channelID, "error = animal undefined");
        }
        else {
          if(chooseName){
            askAdopt = false;
            validAdopt = false;
            chooseName = false;
            let splitName = message.split(' ');
            let name = splitName[splitName.length - 1];
            dialogFlow(bot, channelID, "petName = "+name);
          }
          else {
            let splitText = message.split(' ');
            if(splitText.indexOf('oui', 0) !== -1){
    					dialogFlow(bot, channelID, "validAdopt = true");
    				}
    				else if(splitText.indexOf('non', 0) !== -1){
              askAdopt = false;
    					validAdopt = false;
    					dialogFlow(bot, channelID, "validAdopt = false");
    				}
    				else dialogFlow(bot, channelID, "error = validation undefined");
          }
        }
			}
			else dialogFlow(bot, channelID, message);
		}
	}
});

function dialogFlow(bot, channelID, message, url = null){
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
			let data = res.data.result.fulfillment.speech.split('=');
      if(data[0]=="start"){
        if(user==1) return;
        else user = 1;
        botSay = data[1];
      }
      else if(data[0]=="exit"){
        if(user==1){
          user = 0;
          botSay = data[1];
        }
      }
			else if(data[0]=="askAdopt"){
        if(askAdopt) return;
        botSay = data[1];
				embed = true;
        askAdopt = true;
        params = ({ url:null, fields: [{ name: ":dog:", value: "chien", inline: true }, { name: ":cat:", value: "chat", inline: true }] });
			}
			else if(data[0]=="showAdopt") {
        botSay = data[1];
        embed = true;
        validAdopt = true;
        params = ({ url:url, fields: [{ name: ":white_check_mark:", value: "oui", inline: true }, { name: ":x:", value: "non", inline: true }] });
			}
      else if(data[0]=="validAdopt") {
        if(data[1]=='true'){
          chooseName = true;
          botSay = 'Felicitations !! Comment tu vas l\'appeler ? :';
        }
        else if(data[1]=='false') {
          botSay = 'Dommage ... Continu a chercher :cold_sweat:';
        }
			}
      else botSay = data[0];
      if(embed){
        if(params.url){
          bot.sendMessage({
            to: channelID,
            message: botSay,
            embed: {
              color: 6826080,
              footer: {
                text: ''
              },
              thumbnail:
              {
                url: params.url
              },
              title: '',
              url: '',
              fields: [
                {
                  "name": params.fields[0].name,
                  "value": params.fields[0].value,
                  "inline": params.fields[0].inline
                },
                {
                  "name": params.fields[1].name,
                  "value": params.fields[1].value,
                  "inline": params.fields[1].inline
                }
              ]
            },
            typing: false
          });
        }
        else {
          bot.sendMessage({
            to: channelID,
            message: botSay,
            embed: {
              color: 6826080,
              footer: {
                text: ''
              },
              title: '',
              url: '',
              fields: [
                {
                  "name": params.fields[0].name,
                  "value": params.fields[0].value,
                  "inline": params.fields[0].inline
                },
                {
                  "name": params.fields[1].name,
                  "value": params.fields[1].value,
                  "inline": params.fields[1].inline
                }
              ]
            },
            typing: false
          });
        }
        embed = false;
        return;
      }
      else {
        bot.sendMessage({
          to: channelID,
          message: botSay,
          typing: true
        });
        return;
      }
		}
		catch(error){ console.log(error) }
	});
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
