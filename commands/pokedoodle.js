const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('pokedoodle')
        .setDescription('Used to search for a doodle in the DB')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The pokemons exact name as registered')
                .setRequired(true)),
    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            interaction.deferReply({ ephemeral: true });

            const pokemonName = interaction.options.getString('name').toLowerCase();
            const pokemon = await interaction.client.Tags.findOne({ where: { name: pokemonName } });

            let data = ['Test Data:'];
            if (pokemon) {
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
            }

            return interaction.followUp('No pokemon found in the DB');
        } catch (error) {
            return console.log(error);
        }
    },
};