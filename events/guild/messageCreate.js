
const Discord = require('discord.js');

/**
 * Message event fires when a message is sent in the server
 * @param {Discord.Client} client 
 * @param {Discord.Message} message
 */


module.exports = (client, message) => {
    try {
        if (message.author.bot) {
            return
        }
        const prefix = '!pokedoodle';



        if (!message.content.startsWith(prefix) || message.author.bot) {
            return;
        } else {
            /**
             * register command goes here!!
             */
        }
    } catch (error) {
        console.log(error);
    }
}