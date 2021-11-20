const Discord = require('discord.js');



/**
 * This event fires when the bot connects to a new guild, its main purpose is to complete
 * essential setup commands prior to the bot being in use.
 * @param {Discord.Client} client 
 * @param {Discord.Guild} guild 
 */

module.exports = async (client, guild) => {
    try {
        console.log(`New Guild: ${guild.name} connnected.`);
    } catch (error) {
        console.log(error);
    }
}