const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, MessageAttachment } = require('discord.js');
const Sequelize = require('sequelize');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: false,
    data: new SlashCommandBuilder()
        .setName('randomdoodle')
        .setDescription('Used to get a random doodle from the DB'),

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            const pokemon = await interaction.client.Tags.findOne({
                order: Sequelize.literal('random()')
            });

            const name = pokemon.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
            const doodle = new MessageAttachment(pokemon.get('doodle'), `${name}.png`);
            return await interaction.reply({ content: `#${pokemon.get('dexNumber').toString().padStart(3, '0')} - ${name}`, files: [doodle], components: [] });


        } catch (error) {
            await interaction.reply('An error occured, which shouldnt be possible please let the bot author know!');
            return console.log(error);
        }
    },
};