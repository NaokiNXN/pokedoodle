const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, MessageAttachment } = require('discord.js');
const Sequelize = require('sequelize');
const Jimp = require('jimp');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: false,
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Use to start a new game of guess that pokemon!'),

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const pokemon = await interaction.client.Tags.findOne({
                order: Sequelize.literal('random()')
            });

            const name = pokemon.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
            const doodleBuffer = pokemon.get('doodle');

            const doodle = await Jimp.read(doodleBuffer).then(async image => {
                return await image.resize(420,380);
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured when resizing the image please log with bot author');
            });

            const guess = await Jimp.read('/usr/src/bot/commands/assets/wtp.png').then(async image => {
                return await image.composite(doodle.brightness(-1), 138, 134);
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured when applying pokemon to background, please log with bot author');
            });
            
            await guess.getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                const finalImg = new MessageAttachment(buffer, `${name}.png`);
                return await interaction.followUp({content: `Starting from now you have 2 minutes to guess this pokemon!`, files: [finalImg] });
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured when sending the final image, please log with the bot author');
            });


        } catch (error) {
            await interaction.reply('An error occured, which shouldnt be possible please let the bot author know!');
            return console.log(error);
        }
    },
};