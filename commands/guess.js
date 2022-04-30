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

            console.log(`Sending data for pokemon ${pokemon.get('name')}`);

            const doodle = await Jimp.read(doodleBuffer).then(async image => {
                return await image.resize(420, 380);
            }).catch(err => {
                console.log(err);
                return interaction.followUp(`An error has occured during doodle resize of pokemon ${pokemon.get('name')}, please log this with the bot maker`);
            });

            const guess = await Jimp.read('/usr/src/bot/commands/assets/wtp.png').then(async image => {
                const guess = await image.clone().composite(doodle.clone().brightness(-1), 138, 134);
                const trueImage = await image.composite(doodle, 138, 134);
                return [guess, trueImage];
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured when applying pokemon to background, please log with bot author');
            });

            await guess[0].getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                const finalImg = new MessageAttachment(buffer, `${name}.png`);
                return await interaction.followUp({ content: `Starting from now you have 2 minutes to guess this pokemon!`, files: [finalImg] });
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured when sending the final image, please log with the bot author');
            });

            const filter = m => m.content.toLowerCase().includes(name.toLowerCase().split(' ').pop());

            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async message => {
                return await message.reply(`Congratulations ${message.author}!!! You guessed correctly it was ${name}`);
            });

            collector.on('end', async collected => {
                await guess[1].getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                    const finalImg = new MessageAttachment(buffer, `${name}.png`);
                    return await interaction.channel.send({ files: [finalImg] });
                }).catch(err => {
                    console.log(err);
                    return interaction.followUp('An error occured when sending the true final image, please log with the bot author');
                });

                if (collected.size != 0) return;
                return await interaction.followUp(`Tough luck no one guessed correctly it was ${name}`);
            });

        } catch (error) {
            await interaction.reply('An error occured, which shouldnt be possible please let the bot author know!');
            return console.log(error);
        }
    },
};