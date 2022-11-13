const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, AttachmentBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
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
            await interaction.deferReply();


            async function dexGenerator(pokemon) {
                const dex = await Jimp.read('/usr/src/bot/commands/assets/dex.png');
                const doodle = await Jimp.read(pokemon.get('doodle')).then(image => {
                    return image.resize(225, 225);
                }).catch(err => {
                    console.log(err);
                    return interaction.followUp(`An error has occured during doodle resize of pokemon ${pokemon.get('name')}, please log this with the bot maker`);
                });
                await dex.composite(doodle, 110, 130);

                const pokemonData = await Jimp.loadFont('/usr/src/bot/commands/assets/pokemon_32.fnt').then(font => {
                    let dataSpace = {
                        types: [110, 60],
                        dimensions: [230, 36],
                        stats: [280, 30],
                        name: [298, 128],
                        dex: [302, 138]
                    }

                    if (!pokemon.get('type2')) dataSpace.types = [dataSpace.types[0] * 2, dataSpace.types[1]];

                    const type1 = new Jimp(Jimp.measureText(font, pokemon.get('type1')), Jimp.measureTextHeight(font, pokemon.get('type1')))
                        .print(font, 0, 0, pokemon.get('type1'))
                        .contain(dataSpace.types[0], dataSpace.types[1]);



                    const type2 = (() => {
                        if (pokemon.get('type2')) {
                            return new Jimp(Jimp.measureText(font, pokemon.get('type2')), Jimp.measureTextHeight(font, pokemon.get('type2')))
                                .print(font, 0, 0, pokemon.get('type2'))
                                .contain(dataSpace.types[0], dataSpace.types[1]);
                        }
                    })();


                    const height = new Jimp(Jimp.measureText(font, `Height: ${pokemon.get('height')}m`), Jimp.measureTextHeight(font, `Height: ${pokemon.get('height')}m`))
                        .print(font, 0, 0, `Height: ${pokemon.get('height')}m`)
                        .contain(dataSpace.dimensions[0], dataSpace.dimensions[1]);

                    const Weight = new Jimp(Jimp.measureText(font, `Weight: ${pokemon.get('weight')}kg`), Jimp.measureTextHeight(font, `Weight: ${pokemon.get('weight')}kg`))
                        .print(font, 0, 0, `Weight: ${pokemon.get('weight')}kg`)
                        .contain(dataSpace.dimensions[0], dataSpace.dimensions[1]);


                    const statText = [
                        'Base Stats',
                        `HP - ${pokemon.get('hp')}`,
                        `Atk - ${pokemon.get('atk')}`,
                        `def - ${pokemon.get('def')}`,
                        `SpA - ${pokemon.get('specialAtk')}`,
                        `SpD - ${pokemon.get('specialDef')}`,
                        `Spe - ${pokemon.get('speed')}`
                    ];

                    let stats = [];

                    statText.forEach((value, index) => {
                        stats.push(new Jimp(Jimp.measureText(font, value), Jimp.measureTextHeight(font, value))
                            .print(font, 0, 0, value)
                            .contain(dataSpace.stats[0], dataSpace.stats[1]))
                    });

                    const dexNameText = `#${pokemon.get('dexNumber').toString().padStart(3, '0')} - ${pokemon.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')}`;

                    const dexName = new Jimp(Jimp.measureText(font, dexNameText), Jimp.measureTextHeight(font, dexNameText))
                        .print(font, 0, 0, dexNameText)
                        .contain(dataSpace.name[0], dataSpace.name[1]);

                    const dexArray = pokemon.get('dexEntry').split(' ');

                    let rawDexEntry = [];
                    let dexEntry = [];

                    dexArray.forEach((value, index) => {
                        rawDexEntry.push(value);
                        if(Jimp.measureText(font, rawDexEntry.map((x) => x).join(' ')) > 800) {
                            dexEntry.push(rawDexEntry.join(' '));
                            rawDexEntry = [];
                        }
                    });
                    dexEntry.push(rawDexEntry.join(' '));

                    let jimpedDex = [];
                    dexEntry.forEach((value, index) => {
                        try {
                        jimpedDex.push(new Jimp(Jimp.measureText(font, value), Jimp.measureTextHeight(font, value))
                            .print(font, 0, 0, value)
                            .contain(dataSpace.dex[0], Math.floor((dataSpace.dex[1]/dexEntry.length))))
                        } catch (err) {
                            console.log(err)
                            console.log(jimpedDex);
                            console.log(dexEntry);
                        }
                    });
                    
                    
                    

                    return {
                        types: [type1, type2],
                        height: height,
                        weight: Weight,
                        stats: [stats, dataSpace.stats[1]],
                        dexName: dexName,
                        dexEntry: [jimpedDex, dataSpace.dex[1]]
                    }
                });

                if (pokemonData.types[1]) {
                    await dex.composite(pokemonData.types[0], 120, 362);
                    await dex.composite(pokemonData.types[1], 250, 362)
                } else {
                    await dex.composite(pokemonData.types[0], 110, 362);
                }

                await dex.composite(pokemonData.height, 110, 420);
                await dex.composite(pokemonData.weight, 110, 456);

                let heightCounter = -26;
                for (const value of pokemonData.stats[0]) {
                    heightCounter += 26;
                    await dex.composite(value, 92, 500 + heightCounter);
                }

                await dex.composite(pokemonData.dexName, 512, 194);

                const yIncrement = Math.floor(pokemonData.dexEntry[1]/pokemonData.dexEntry[0].length);
                const startPos = [ 515, 592 ]
                pokemonData.dexEntry[0].forEach(async ( value, index ) => {
                    if (index === 0) {
                        await dex.composite(value, startPos[0], startPos[1]);
                    } else {
                        await dex.composite(value, startPos[0], startPos[1] + (yIncrement*index));
                    }
                })

                return dex;
            }


            if (interaction.options.getString('name')) {
                const pokemonName = interaction.options.getString('name').toLowerCase();
                const pokemon = await interaction.client.Tags.findOne({ where: { name: pokemonName } });
                
                console.log(`Sending data for pokemon ${pokemonName}`);
                
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
                        const doodle = new AttachmentBuilder(buffer, `${pokemonName}.png`);
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
                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
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
                        const doodle = new AttachmentBuilder(buffer, `${pokemon.get('name')}DEX.png`);
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
                    const doodle = new AttachmentBuilder(buffer, `${p.get('name')}DEX.png`);
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