const { SlashCommandBuilder } = require('@discordjs/builders');


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
                .setDescription('Create a backup of the db file')
        .addSubcommand(subcommand =>
            subcommand
                .setName('restore')
                .setDescription('Restore a backup from file'))),

    async execute(interaction) {
        try {
            const filePath = './database/database.sqlite';
            if (interaction.options.getSubcommand() === 'backup') {
                await interaction.reply({content: 'This is the database backup.', files: [filePath], ephemeral: true});
            } else {
                await interaction.reply({content: 'WIP DATABASE RESTORATION NOT YET IMPLEMENTED', ephemeral: true });
            }
        } catch (err) {
            console.log(err);
        }
    },
};