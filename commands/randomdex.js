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
        .setName('randomdex')
        .setDescription('Used to get a random dex entry from the DB'),

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const pokemon = await interaction.client.Tags.findOne({
                order: Sequelize.literal('random()')
            });


            async function dexGenerator(pokemon) {
                const dex = await Jimp.read('/usr/src/bot/commands/assets/dex.png');
                const doodle = await Jimp.read(pokemon.get('doodle')).then(image => {
                    return image.resize(225, 225);
                }).catch(err => {
                    console.log(err);
                    return interaction.followUp('An error has occured during dex generation doodle resize, please log this with the bot maker');
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
                        if (Jimp.measureText(font, rawDexEntry.map((x) => x).join(' ')) > 800) {
                            dexEntry.push(rawDexEntry.join(' '));
                            rawDexEntry = [];
                        }
                    });
                    dexEntry.push(rawDexEntry.join(' '));

                    let jimpedDex = [];
                    dexEntry.forEach((value, index) => {
                        jimpedDex.push(new Jimp(Jimp.measureText(font, value), Jimp.measureTextHeight(font, value))
                            .print(font, 0, 0, value)
                            .contain(dataSpace.dex[0], Math.floor((dataSpace.dex[1] / dexEntry.length))))
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

                const yIncrement = Math.floor(pokemonData.dexEntry[1] / pokemonData.dexEntry[0].length);
                const startPos = [515, 592]
                pokemonData.dexEntry[0].forEach(async (value, index) => {
                    if (index === 0) {
                        await dex.composite(value, startPos[0], startPos[1]);
                    } else {
                        await dex.composite(value, startPos[0], startPos[1] + (yIncrement * index));
                    }
                })

                return dex;
            }

            const dex = await dexGenerator(pokemon);
            await dex.getBufferAsync(Jimp.MIME_PNG).then(async buffer => {
                const doodle = new MessageAttachment(buffer, `${pokemon.get('name')}DEX.png`);
                return interaction.followUp({ files: [doodle] });
            }).catch(err => {
                console.log(err);
                return interaction.followUp('An error occured whilst generating and sending the attachment during a random dex based search, please log this with the bot maker');
            });
            return;

        } catch (error) {
            await interaction.reply('An error occured, which shouldnt be possible please let the bot author know!');
            return console.log(error);
        }
    },
};