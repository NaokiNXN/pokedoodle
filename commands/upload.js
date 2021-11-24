const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, Message } = require('discord.js');
const Jimp = require('jimp');

/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Used to upload a pokedoodle, only run after registering the pokemon with /register'),
    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            interaction.reply('Please upload the pokedoodle picture after this message, you will have 60 seconds to do so. Please note the file name must match the pokemon name exactly as registered.');

            const user = interaction.user.id;

            const filter = message => message.author.id === user;

            interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
                .then(async (collected) => {
                    const message = collected.first()
                    const attachment = message.attachments.first();
                    if (!attachment) {
                        return message.reply('No upload detected please try again');
                    }
                    const pokemon = await message.client.Tags.findOne({ where: { name: attachment.name.split('.')[0].split('_').join(' ').toLowerCase() } }).then(db => {
                        if (db) return db.get('name');
                    });
                    if (pokemon) {
                        return Jimp.read(attachment.url).then(async (image) => {
                            await image.getBufferAsync(Jimp.MIME_PNG).then(async(buffer) => {
                                const update = await message.client.Tags.update({ doodle: buffer }, { where: { name: pokemon } });
                                
                                if (update > 0) {
                                    return message.reply(`${pokemon} pokedoodle has been uploaded!`);
                                }

                                return message.reply(`Their was an error loading the image buffer into the DB please log this error with the bot author`);
                            });
                        }).catch(error => {
                            console.log(`Error occured during image upload:\n${error}`);
                            return message.reply('Their was an error whilst trying to get the attachment from discord, please try again and if the error persists please log this error with the bot author');
                        });
                    }
                    return message.reply(`${attachment.name.split('.')[0]} is not currently registered in the DB please use /register first!`);
                })
                .catch(collected => {
                    console.log(collected);
                    return interaction.channel.send('No upload detected within 60 seconds, please try again');
                });



            
        } catch (error) {
            return console.log(error);
        }
    },
};