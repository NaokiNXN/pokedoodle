const Discord = require('discord.js');
const admins = ['151761753032753152', '184251473083760640'];

/**
 * Interaction create event fires when someone uses an interaction
 * If its not a command and if the user has been banned then wont do anything
 * 
 * Otherwise executes commands registered by command handler.
 * @param {Discord.Client} client 
 * @param {Discord.Interaction} interaction 
 */

module.exports = async (client, interaction) => {
    if (!interaction.isCommand() && !interaction.isSelectMenu() && !interaction.isButton()) return;

    let command
    if (interaction.isSelectMenu() || interaction.isButton()) {
        command = client.commands.get(interaction.customId);
    } else {
        command = client.commands.get(interaction.commandName);
    }

    if (!command) return;

    if (command.admin && !admins.includes(interaction.user.id)) {
        return interaction.reply('This is an admin command only this bots Author & DeviousDitto can use this!')
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.log(error);
        await interaction.reply({
            content: 'There was an error while executing this command',
            ephemeral: true
        });
    }
}