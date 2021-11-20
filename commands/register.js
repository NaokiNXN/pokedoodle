const { SlashCommandBuilder } = require('@discordjs/builders');

const types = []


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
            option.setName('dex number')
                .setDescription('The pokedex number corresponding to this pokemon')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('dex entry')
                .setDescription('The pokedex entry for this pokemon!')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type 1')
                .setDescription('The first type for this pokemon! please note type 1 is required additional types are optional.')
                .setRequired(true)
                .addChoices()),
    async execute(interaction) {
        
    },
};