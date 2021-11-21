const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { Interaction } = require('discord.js');

const types = [
    ['Normal', 'Vormal'],
    ['Fire', 'Fire'],
    ['Water', 'Water'],
    ['Grass', 'Grass'],
    ['Electric', 'Electric'],
    ['Ice', 'Ice'],
    ['Fighting', 'Fighting'],
    ['Poison', 'Poison'],
    ['Ground', 'Ground'],
    ['Flying', 'Flying'],
    ['Psychic', 'Psychic'],
    ['Bug', 'Bug'],
    ['Rock', 'Rock'],
    ['Ghost', 'Ghost'],
    ['Dark', 'Dark'],
    ['Dragon', 'Dragon'],
    ['Steel', 'Steel'],
    ['Fairy', 'Fairy']
]

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
                .setDescription('The first type for this pokemon! please note type 1 is required additional types are optional.')
                .setRequired(true)
                .addChoices(types))
        .addStringOption(option =>
            option.setName('type_2')
                .setDescription('The second applicable type for the pokemon, this is optional')
                .setRequired(false)
                .addChoices(types)),


    /**
     * 
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        console.log('Starting register command');

        interaction.reply('Please wait whilst we register this pokemon, once it is done i will send another message on this channel to let you know');

        try {
            const newPokemon = await interaction.client.Tags.create({
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
            });

            await wait(4000).then(interaction.channel.send(`${newPokemon.name} has been added to the DB`));
    

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.channel.send('That pokemon already exists in the DB');
            }
            console.log(error);
            return interaction.channel.send('Something went wrong with adding a tag.');
        }
    },
};