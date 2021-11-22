const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');
const Jimp = require('jimp');



/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: false,
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Used to search for a pokemon in the DB, please use one search argument!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The pokemons exact name as registered'))
        .addIntegerOption(option =>
            option.setName('dex_number')
                .setDescription('The pokedex number for the pokemon you are looking for')),

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            if (
                (!interaction.options.getString('name') && !interaction.options.getInteger('dex_number')) ||
                (interaction.options.getString('name') && interaction.options.getInteger('dex_number'))) {
                return interaction.reply('Please supply either a name or dex number to search, do not give both!')
            }
            interaction.deferReply();


            async function dexGenerator(pokemon) {
                const dex = await Jimp.read('/usr/src/bot/commands/assets/dex.png');
                const doodle = await Jimp.read(pokemon.get('doodle')).then(image => {
                    return image.resize( 225, 225);
                }).catch(err => {
                    console.log(err);
                    return interaction.followUp('An error has occured during dex generation doodle resize, please log this with the bot maker');
                });

                await dex.composite(doodle, 110, 130);

                return dex;
            }


            if (interaction.options.getString('name')) {
                const pokemonName = interaction.options.getString('name').toLowerCase();
                const pokemon = await interaction.client.Tags.findOne({ where: { name: pokemonName } });

                let data = [];
                if (pokemon && !pokemon.get('doodle')) {
                    data.push(`name: ${pokemon.get('name')}`);
                    data.push(`dex number: ${pokemon.get('dexNumber')}`);
                    data.push(`dex entry: ${pokemon.get('dexEntry')}`);
                    data.push(`type: ${pokemon.get('type1')}/${pokemon.get('type2')}`);
                    data.push(`height: ${pokemon.get('height')}`);
                    data.push(`weight: ${pokemon.get('weight')}`);
                    data.push(`hp: ${pokemon.get('hp')}`);
                    data.push(`atk: ${pokemon.get('atk')}`);
                    data.push(`def: ${pokemon.get('def')}`);
                    data.push(`specialAtk: ${pokemon.get('specialAtk')}`);
                    data.push(`specialDef: ${pokemon.get('specialDef')}`);
                    data.push(`speed: ${pokemon.get('speed')}`);
                    return interaction.followUp(data.join('\n'));
                } else if (pokemon && pokemon.get('doodle')) {
                    const dex = await dexGenerator(pokemon);
                    await dex.getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                        const doodle = new MessageAttachment(buffer, `${pokemonName}.png`);
                        return interaction.followUp({ files: [doodle] });
                    }).catch(err => {
                        console.log(err);
                        return interaction.followUp('An error occured whilst generating and sending the attachment during a name based search, please log this with the bot maker');
                    });
                    return;
                }
                return interaction.followUp('No pokemon found in the DB');
            }

            const pokemon = await interaction.client.Tags.findAll({ where: { dexNumber: interaction.options.getInteger('dex_number') } }).then(results => {
                let output = [];
                for (const p of results) {
                    output.push({
                        label: `${p.get('name')}`,
                        description: `Choose this to display this dex entry!`,
                        value: `${p.get('name')}`,
                    });
                }
                return output;
            });

            if (pokemon.length > 0 && pokemon.length != 1) {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('dexSearch')
                            .setPlaceholder('Choose a pokemon from the list to see its dex entry!')
                            .addOptions(pokemon));

                await interaction.followUp({ content: 'Multiple pokemon found with that dex number, please choose an option from the dropdown below, this will only be valid for the next 60 seconds!', components: [row] });

                const filter = i => (i.customId === 'dexSearch' && i.user.id === interaction.user.id);

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async i => {
                    const pokemon = await i.client.Tags.findOne({ where: { name: i.values[0] } });
                    const dex = await dexGenerator(pokemon);
                    await dex.getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                        const doodle = new MessageAttachment(buffer, `${pokemon.get('name')}DEX.png`);
                        return interaction.followUp({ files: [doodle] });
                    }).catch(err => {
                        console.log(err);
                        return interaction.followUp('An error occured whilst generating and sending the attachment during a dex based search, please log this with the bot maker');
                    });
                    return;
                });

                collector.on('end', async collected => {
                    if (collected.size != 0) return;
                    return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /pokedex command!');
                });
                return;
            } else if (pokemon.length === 1) {
                const p = await interaction.client.Tags.findOne({ where: { name: pokemon[0].value } });
                const dex = await dexGenerator(p);
                await dex.getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                    const doodle = new MessageAttachment(buffer, `${p.get('name')}DEX.png`);
                    return interaction.followUp({ files: [doodle] });
                }).catch(err => {
                    console.log(err);
                    return interaction.followUp('An error occured whilst generating and sending the attachment during a dex based search, please log this with the bot maker');
                });
                return;
            }
            return interaction.followUp('No pokemon found in the DB');

        } catch (error) {
            return console.log(error);
        }
    },
};