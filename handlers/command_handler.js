const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../token.json');
const Discord = require('discord.js');

const clientId = '911403531305627678';

/**
 * Change guildID to false in production build
 */
const guildId = '733775299510010049';



/**
 * Command handler loads the commands from the files
 * @param {Discord.Client} client 
 */

module.exports = (client) => {
    const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

    for (const file of command_files) {
        const command = require(`../commands/${file}`);
        if (command.data.name) {
            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        } else {
            continue;
        }
    }

    /**
     * This next section registers the commands as / commands
     * 
     * If no guildId is supplied above then it will register
     * the commands globally.
     */
    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            if (guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId), {
                    body: client.commandArray
                },
                );
                console.log('Succesfully loaded commands to guild');
            } else {
                await rest.put(
                    Routes.applicationCommands(clientId), {
                    body: client.commandArray
                },
                );
                console.log('Succesfully loaded commands to client, please allow up 2 hours for commands to register.');
            }
        } catch (error) {
            console.log(error);
        }
    })();
}