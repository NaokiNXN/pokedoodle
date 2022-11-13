const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const fetch = require('node-fetch');
const splitFile = require('split-file');

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
            const splitDir = './database/split/';
            const mergeDir = './database/merge/';
            if(interaction.options.getSubcommand() === 'backup') {
                
                await fs.copyFileSync(filePath, filePath+'.bk');
                if (!fs.existsSync(splitDir)){
                    fs.mkdirSync(splitDir);
                }
                let files = [];
                await splitFile.splitFileBySize(filePath, 5242880, splitDir)
                    .then((split_file) => {
                        files.push(split_file);
                    })
                    .catch((err) => {
                        console.log('Error: ', err);
                    });

                await interaction.reply('Backup files generated, these have been sent to you directly');
                await interaction.member.send({content: 'These are the backup files!!!', files: files[0]});
            }
            else if (interaction.options.getSubcommand() === 'restore') {
                await interaction.reply('Starting db restoration, please send a message to this bot specifically confirming the number of files you are uploading eg send 5 if you are uploading 5 files');
                if (!fs.existsSync(mergeDir)){
                    fs.mkdirSync(mergeDir);
                }
                

                const user = interaction.member.user;
                const DM = await interaction.member.send({content: `Please confirm the number of files to upload:`});

                const filter = m => m.author.id === user.id;

                
                let fileNum = 1;
                await DM.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then(async (collected) => {
                        fileNum = collected.first().content;
                        if(!fs.existsSync(filePath+'.bk')) {
                            await fs.copyFileSync(filePath, filePath+'.bk');   
                        } 

                        let files = [];

                    
                        async function upload() {
                            if(fileNum === 0) {
                                if (fs.existsSync(filePath)) {
                                    await fs.rmSync(filePath)
                                }
                                await splitFile.mergeFiles(files.reverse(), filePath).then(() => {
                                    console.log('Now merging following DB partials: ' + files);
                                    interaction.client.dbRefresh(interaction.client);
                                }).catch(async (err) => {
                                    console.log(err)
                                    return await DM.channel.send('Error occured when merging DB partials, please inform bot author');
                                });
                                return await DM.channel.send('Upload complete now refreshing DB please wait for up to 5 minutes for DB refresh');
                            }

                            await DM.channel.send('Please upload part '+ fileNum);
                            await DM.channel.awaitMessages({filter, max: 1, time: 60000, errors: ['time'] })
                                .then(async (rcvd) => {
                                    
                                    
                                    const attachment = rcvd.first().attachments.first();
                                    if (!attachment) {
                                        return rcvd.first().reply('No upload detected, you will need to restart from scratch');
                                    }

                                    if (fs.existsSync(mergeDir+`database.sqlite.sf-part${fileNum}`)) {
                                        await fs.rmSync(mergeDir+`database.sqlite.sf-part${fileNum}`);
                                    }
                                    files.push(mergeDir+`database.sqlite.sf-part${fileNum}`);

                                    await fetch(attachment.url)
                                        .then(res => res.buffer())
                                        .then(buffer => {
                                            return fs.writeFileSync(mergeDir+`database.sqlite.sf-part${fileNum}`, buffer);
                                        });

                                    fileNum -= 1;
                                    upload();
                                }).catch(rcvd => {
                                    console.log(rcvd);
                                    return DM.channel.send('No upload detected within 60 seconds, please try again from scratch');
                                });
                        }
                        upload();
                    }).catch(collected => {
                        console.log(collected);
                        return interaction.channel.send('No upload detected within 60 seconds, please try again');
                    });
            }
            else {
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