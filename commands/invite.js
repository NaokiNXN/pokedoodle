const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Sequelize = require('sequelize');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: false,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite this bot or build&host it yourself'),

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite')
                        .setStyle(5)
                        .setURL('https://discord.com/api/oauth2/authorize?client_id=911403531305627678&permissions=277025491968&scope=bot%20applications.commands'),
                    new ButtonBuilder()
                        .setLabel('Github')
                        .setStyle(5)
                        .setURL('https://github.com/NaokiNXN/pokedoodle')
                ); 

            await interaction.reply({
                content: 'If you would like to invite this bot your own server just click the invite link below\nOr if you would like to see the code or host this bot yourself please use the github link!',
                components: [row]
            });
        } catch (error) {
            await interaction.reply('An error occured, which shouldnt be possible please let the bot author know!');
            return console.log(error);
        }
    },
};