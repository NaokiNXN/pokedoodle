const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { Interaction } = require('discord.js');
const { data } = require('./register');

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
                .setDescription('The pokemons exact name as registered')
                .setRequired(true)),
    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            const pokemonName = interaction.options.getString('name');

            const pokemon = await interaction.client.Tags.findOne({ where: { name: pokemonName } });

            data = [];
            if (pokemon) {
                Object.entries(pokemon).forEach((key, value) => {
                    data.push(`${key}: ${value}`);
                });
            }

            return interaction.reply(data.join('\n'));
        } catch (error) {
            return console.log(error);
        }
    },
};