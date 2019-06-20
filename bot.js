const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');

const dialogflow = require('dialogflow');
const uuid = require('uuid');

async function runSample(projectId = 'my-project-1525857606051') {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: 'hello',
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
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

let asleep = true;
let state = 'undef';

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
							if(asleep){
								asleep = false;
								logger.info(message);
						    //message.channel.startTyping()
                bot.sendMessage({
                    to: channelID,
                    message: 'Bonjour '+user+' ! :kissing_smiling_eyes:'
                });
							}
							else {
								asleep = true;
								logger.info(message);
						    //message.channel.startTyping()
                bot.sendMessage({
                    to: channelID,
                    message: 'Au revoir '+user+' ! :grin:'
                });
							}
            break;
            // Just add any case commands if you want to..
         }
     }
		 if (!asleep){
			 let words = message.split(' ');
			 words.forEach(function(word){
				 if(word=='Machine' || word=='Machine.'){
					 bot.sendMessage({
							 to: channelID,
							 message: 'Meow'
					 });
				 }
				 else if(word=='adoption' || word=='adopter'){
					 if(words.indexOf('chien')>0 && words.indexOf('chat')>0){
						 bot.sendMessage({
								 to: channelID,
								 message: 'Fais ton choix mon gars.'
						 });
					 }
					 else if(words.indexOf('chat')>0){
						 bot.sendMessage({
								 to: channelID,
								 message: 'C\'est partis pour un chat ! :cat:'
						 });
					 }
					 else if(words.indexOf('chien')>0){
						 bot.sendMessage({
								 to: channelID,
								 message: 'Allons-y pour un chien ! :dog:'
						 });
					 }
					 else {
						 bot.sendMessage({
								 to: channelID,
								 message: 'Tu préfères un chien ou un chat ?'
						 });
					 }
				 }
			 });
		 }
});
