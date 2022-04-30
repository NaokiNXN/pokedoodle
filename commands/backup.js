const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Backup command allows you to create/restore a backup
 */

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('restore/create a backup of the db')
        .addSubcommand(subcommand =>
            subcommand
                .setName('backup')
                .setDescription('Create a backup of the db file'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('restore')
                .setDescription('Restore a backup from file'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('local_restore')
                .setDescription('Restores a local backup if one exists')),

    async execute(interaction) {
        try {
            const filePath = './database/database.sqlite';
            if (interaction.options.getSubcommand() === 'backup') {
                await interaction.reply({ content: 'This is the database backup.', files: [filePath], ephemeral: true });
                if (!fs.existsSync(filePath+'.bk')) {
                    await fs.copyFileSync(filePath, filePath+'.bk');
                }
            } else if (interaction.options.getSubcommand() === 'restore') {
                await interaction.reply({ content: 'Please upload the database backup!\n--Please note: when uploading the backup it will be available for everyone to view, as such please delete the message containing the upload following the confirmation message!', ephemeral: true });

                const user = interaction.user.id;

                const filter = message => message.author.id === user;

                interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
                    .then(async (collected) => {
                        const message = collected.first();
                        const attachment = message.attachments.first();
                        if (!attachment) {
                            return message.reply('No upload detected please try again!');
                        }

                        if(!/\.(sqlite)$/.test(attachment.url)) {
                            return message.reply('This is not a valid database backup file please try again!');
                        }

                        if (fs.existsSync(filePath)) {
                            await fs.copyFileSync(filePath, filePath+'.bk');
                            await fs.rmSync(filePath)
                        }
                        
                        await fetch(attachment.url)
                            .then(res => res.buffer())
                            .then(buffer => {
                                return fs.writeFileSync(filePath, buffer);
                            });

                        interaction.client.dbRefresh(interaction.client);
                        return message.reply('Upload complete, backup restored to DB!');
                    })
                    .catch(collected => {
                        console.log(collected);
                        return interaction.channel.send('No upload detected within 60 seconds, please try again');
                    });
            } else {
                if(fs.existsSync(filePath+'.bk')) {
                    await fs.rmSync(filePath);
                    await fs.copyFileSync(filePath+'.bk', filePath);

                    interaction.client.dbRefresh(interaction.client);

                    await interaction.reply({ content: 'DB restored from local backup!', ephemeral: true});
                } else {
                    await interaction.reply({ content: 'Local backup doesnt exist now creating one!', ephemeral: true });
                    await fs.copyFileSync(filePath, filePath+'.bk');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
};