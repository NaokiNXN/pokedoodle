const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');



/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: false,
    data: new SlashCommandBuilder()
        .setName('pokedoodle')
        .setDescription('Used to search for a doodle in the DB, please use one search argument!')
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
                    const doodle = new MessageAttachment(pokemon.get('doodle'), `${pokemonName}.png`);
                    const name = pokemon.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
                    return interaction.followUp({ content: `#${pokemon.get('dexNumber').toString().padStart(3, '0')} - ${name}`, files: [doodle] });
                }
                return interaction.followUp('No pokemon found in the DB');
            }

            const pokemon = await interaction.client.Tags.findAll({ where: { dexNumber: interaction.options.getInteger('dex_number') } }).then(results => {
                let output = [];
                for (const p of results) {
                    output.push({
                        label: `${p.get('name')}`,
                        description: `Choose this to display this pokedoodle!`,
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
                            .setPlaceholder('Choose a pokemon from the list to see its doodle!')
                            .addOptions(pokemon));

                await interaction.followUp({ content: 'Multiple pokemon found with that dex number, please choose an option from the dropdown below, this will only be valid for the next 60 seconds!', components: [row] });

                const filter = i => (i.customId === 'dexSearch' && i.user.id === interaction.user.id);

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async i => {
                    const pokemon = await i.client.Tags.findOne({ where: { name: i.values[0] } });
                    const name = pokemon.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
                    const doodle = new MessageAttachment(pokemon.get('doodle'), `${name}.png`);
                    return await i.update({ content: `#${pokemon.get('dexNumber').toString().padStart(3, '0')} - ${name}`, files: [doodle], components: [] });
                });

                collector.on('end', async collected => {
                    if (collected.size != 0) return;
                    return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /register command!');
                });
                return;
            } else if (pokemon.length === 1) {
                const p = await interaction.client.Tags.findOne({ where: { name: pokemon[0].value } });
                const name = p.get('name').split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
                const doodle = new MessageAttachment(p.get('doodle'), `${name}.png`);
                return await interaction.followUp({ content: `#${p.get('dexNumber').toString().padStart(3, '0')} - ${name}`, files: [doodle], components: [] });
            }
            return interaction.followUp('No pokemon found in the DB');

        } catch (error) {
            return console.log(error);
        }
    },
};