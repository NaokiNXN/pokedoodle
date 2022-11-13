const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { Interaction, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { stringify } = require('querystring');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Used to register a new pokedoodle in the DB')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The pokemons name, if special form e.g. Allolan or Shiny include this in the name!')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('dex_number')
                .setDescription('The pokedex number corresponding to this pokemon')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('dex_entry')
                .setDescription('The pokedex entry for this pokemon!')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('height')
                .setDescription('The pokemons Height')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('weight')
                .setDescription('The weight of the pokemon.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hp')
                .setDescription('The pokemonss hp')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('atk')
                .setDescription('The pokemons base attack stat')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('def')
                .setDescription('The pokemons base defense stat')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('spatk')
                .setDescription('The special attack stat')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('spdef')
                .setDescription('The pokemons base special defense stat')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('speed')
                .setDescription('The pokemons base speed stat')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type_1')
                .setDescription('The first applicable type for the pokemon, non-optional')
                .setRequired(true)
                .addChoices(
                    { name: 'Normal', value: 'Normal' },
                    { name: 'Fire', value: 'Fire' },
                    { name: 'Water', value: 'Water' },
                    { name: 'Grass', value: 'Grass' },
                    { name: 'Electric', value: 'Electric' },
                    { name: 'Ice', value: 'Ice' },
                    { name: 'Fighting', value: 'Fighting' },
                    { name: 'Poison', value: 'Poison' },
                    { name: 'Ground', value: 'Ground' },
                    { name: 'Flying', value: 'Flying' },
                    { name: 'Psychic', value: 'Psychic' },
                    { name: 'Bug', value: 'Bug' },
                    { name: 'Rock', value: 'Rock' },
                    { name: 'Ghost', value: 'Ghost' },
                    { name: 'Dark', value: 'Dark' },
                    { name: 'Dragon', value: 'Dragon' },
                    { name: 'Steel', value: 'Steel' },
                    { name: 'Fairy', value: 'Fairy' })
        )
        .addStringOption(option =>
            option.setName('type_2')
                .setDescription('The second applicable type for the pokemon, this is optional')
                .setRequired(false)
                .addChoices(
                    { name: 'Normal', value: 'Normal' },
                    { name: 'Fire', value: 'Fire' },
                    { name: 'Water', value: 'Water' },
                    { name: 'Grass', value: 'Grass' },
                    { name: 'Electric', value: 'Electric' },
                    { name: 'Ice', value: 'Ice' },
                    { name: 'Fighting', value: 'Fighting' },
                    { name: 'Poison', value: 'Poison' },
                    { name: 'Ground', value: 'Ground' },
                    { name: 'Flying', value: 'Flying' },
                    { name: 'Psychic', value: 'Psychic' },
                    { name: 'Bug', value: 'Bug' },
                    { name: 'Rock', value: 'Rock' },
                    { name: 'Ghost', value: 'Ghost' },
                    { name: 'Dark', value: 'Dark' },
                    { name: 'Dragon', value: 'Dragon' },
                    { name: 'Steel', value: 'Steel' },
                    { name: 'Fairy', value: 'Fairy' })
        ),

    /**
     * 
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        console.log('Starting register command');
        await interaction.deferReply();

        try {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('registerYes')
                        .setLabel('Yes')
                        .setStyle(3),
                    new ButtonBuilder()
                        .setCustomId('registerNo')
                        .setLabel('No')
                        .setStyle(4)
                );

            let data = [
                'The following information will be registered in the DB, please check that all the information is correct and then press yes, or no if you need to correct anything.',
                `Name: ${interaction.options.getString('name')}, Dex Number: ${interaction.options.getInteger('dex_number')}`,
                `DexEntry: ${interaction.options.getString('dex_entry')}`,
                `Type 1: ${interaction.options.getString('type_1')}, Type 2: ${interaction.options.getString('type_2')}`,
                `Height: ${interaction.options.getNumber('height')}, Weight: ${interaction.options.getNumber('weight')}`,
                'Stats:',
                `HP: ${interaction.options.getInteger('hp')}, ATK: ${interaction.options.getInteger('atk')}, DEF: ${interaction.options.getInteger('def')}, SpecialATK: ${interaction.options.getInteger('spatk')}, SpecialDEF: ${interaction.options.getInteger('spdef')}, Speed: ${interaction.options.getInteger('speed')}`
            ]

            await interaction.followUp({
                content: data.join('\n'),
                components: [row]
            });


            const filter = i => (i.customId === 'registerYes' && i.user.id === interaction.user.id) || (i.customId === 'registerNo' && i.user.id === interaction.user.id);

            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async i => {
                try {
                    if (i.customId === 'registerNo') {
                        return await i.update({ content: `DB update aborted!`, components: [] });
                    } else if (i.customId === 'registerYes') {
                        console.log('register confirmed now creating entry!');

                        const newPokemon = {
                            name: interaction.options.getString('name').toLowerCase(),
                            dexNumber: interaction.options.getInteger('dex_number'),
                            dexEntry: interaction.options.getString('dex_entry'),
                            type1: interaction.options.getString('type_1'),
                            type2: interaction.options.getString('type_2'),
                            height: interaction.options.getNumber('height'),
                            weight: interaction.options.getNumber('weight'),
                            hp: interaction.options.getInteger('hp'),
                            atk: interaction.options.getInteger('atk'),
                            def: interaction.options.getInteger('def'),
                            specialAtk: interaction.options.getInteger('spatk'),
                            specialDef: interaction.options.getInteger('spdef'),
                            speed: interaction.options.getInteger('speed')
                        }

                        console.table(newPokemon);

                        await interaction.client.Tags.create(newPokemon);
                        console.log('Register confirmed now responding to confirm!');
                        return await i.update({ content: `The new Pokemon has been registered!`, components: [] })
                    }
                } catch (error) {
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        console.log('Sequelize error: entry already exists falling back to backup method!')
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('registerYes')
                                    .setLabel('Yes')
                                    .setStyle(3),
                                new ButtonBuilder()
                                    .setCustomId('registerNo')
                                    .setLabel('No')
                                    .setStyle(4)
                            );

                        interaction.client.pokemonUpdate = {
                            name: interaction.options.getString('name').toLowerCase(),
                            dexNumber: interaction.options.getInteger('dex_number'),
                            dexEntry: interaction.options.getString('dex_entry'),
                            type1: interaction.options.getString('type_1'),
                            type2: interaction.options.getString('type_2'),
                            height: interaction.options.getNumber('height'),
                            weight: interaction.options.getNumber('weight'),
                            hp: interaction.options.getInteger('hp'),
                            atk: interaction.options.getInteger('atk'),
                            def: interaction.options.getInteger('def'),
                            specialAtk: interaction.options.getInteger('spatk'),
                            specialDef: interaction.options.getInteger('spdef'),
                            speed: interaction.options.getInteger('speed')
                        };

                        await i.update({ content: `${interaction.options.getString('name')} already exists in the DB if you would like to modify the stats using the new information provided please click yes, otherwise click no`, components: [row] });

                        const filter = i => (i.customId === 'registerYes' && i.user.id === interaction.user.id) || (i.customId === 'registerNo' && i.user.id === interaction.user.id);

                        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

                        collector.on('collect', async i => {
                            if (i.customId === 'registerNo') {
                                return await i.update({ content: `DB update aborted!`, components: [] });
                            } else if (i.customId === 'registerYes') {
                                const pokemon = await i.client.Tags.findOne({ where: { name: i.client.pokemonUpdate.name } });
                                pokemon.set(i.client.pokemonUpdate).save();
                                return await i.update({ content: `The DB has been updated using the new data!`, components: [] })
                            }
                        })

                        collector.on('end', async collected => {
                            if (collected.size != 0) return;
                            return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /register command!');
                        });
                        return;
                    }
                    console.log(error);
                }
            })

            collector.on('end', async collected => {
                if (collected.size != 0) return;
                return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /register command!');
            });
            return;

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('registerYes')
                            .setLabel('Yes')
                            .setStyle(3),
                        new ButtonBuilder()
                            .setCustomId('registerNo')
                            .setLabel('No')
                            .setStyle(4)
                    );

                interaction.client.pokemonUpdate = {
                    name: interaction.options.getString('name').toLowerCase(),
                    dexNumber: interaction.options.getInteger('dex_number'),
                    dexEntry: interaction.options.getString('dex_entry'),
                    type1: interaction.options.getString('type_1'),
                    type2: interaction.options.getString('type_2'),
                    height: interaction.options.getNumber('height'),
                    weight: interaction.options.getNumber('weight'),
                    hp: interaction.options.getInteger('hp'),
                    atk: interaction.options.getInteger('atk'),
                    def: interaction.options.getInteger('def'),
                    specialAtk: interaction.options.getInteger('spatk'),
                    specialDef: interaction.options.getInteger('spdef'),
                    speed: interaction.options.getInteger('speed')
                };

                await interaction.followUp({ content: `${interaction.options.getString('name')} already exists in the DB if you would like to modify the stats using the new information provided please click yes, otherwise click no`, components: [row] });

                const filter = i => (i.customId === 'registerYes' && i.user.id === interaction.user.id) || (i.customId === 'registerNo' && i.user.id === interaction.user.id);

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'registerNo') {
                        return await i.update({ content: `DB update aborted!`, components: [] });
                    } else if (i.customId === 'registerYes') {
                        const pokemon = await i.client.Tags.findOne({ where: { name: i.client.pokemonUpdate.name } });
                        pokemon.set(i.client.pokemonUpdate).save();
                        return await i.update({ content: `The DB has been updated using the new data!`, components: [] })
                    }
                })

                collector.on('end', async collected => {
                    if (collected.size != 0) return;
                    return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /register command!');
                });
                return;
            }
            console.log(error);
            return interaction.followUp('Something went wrong with adding that pokemon, double check the details before you try again.');
        }
    },
};