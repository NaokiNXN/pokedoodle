const Discord = require('discord.js');

/**
 * Intents and token setup and assignment
 */

const botIntents = new Discord.Intents();
botIntents.add(
    Discord.Intents.FLAGS.GUILDS
);

const client = new Discord.Client({ intents: botIntents });

const { token } = require('./token.json');

/**
 * Command & event collections mapped to client for easy access in handlers
 */

client.commands = new Discord.Collection();
client.commandArray = [];
client.events = new Discord.Collection();
client.cooldowns = new Set();


//DB SETUP


/**
 * Loads the handlers and passess the client to them
 */

 ['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client)
});

client.login(token);