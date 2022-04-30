const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction, MessageActionRow, MessageButton } = require('discord.js');


/**
 * Register command takes the pokemon stats as an 
 * input and applies it to the DB
 */

module.exports = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Used to delete the most recent dex entry if a mistake is made'),
    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const pokemon = await interaction.client.Tags.findOne({
                order: [['id', 'DESC']],
            });

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('unregisterYes')
                    .setLabel('Yes')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('unregisterNo')
                    .setLabel('No')
                    .setStyle('DANGER')
            );

            let data = [
                'The following information will be removed from the DB, Yes or No?',
                `Name: ${pokemon.get('name')}, Dex Number: ${pokemon.get('dexNumber')}`,
                `DexEntry: ${pokemon.get('dexEntry')}`,
                `Type 1: ${pokemon.get('type1')}, Type 2: ${pokemon.get('type2')}`,
                `Height: ${pokemon.get('height')}, Weight: ${pokemon.get('weight')}`,
                'Stats:',
                `HP: ${pokemon.get('hp')}, ATK: ${pokemon.get('atk')}, DEF: ${pokemon.get('def')}, SpecialATK: ${pokemon.get('specialAtk')}, SpecialDEF: ${pokemon.get('specialDef')}, Speed: ${pokemon.get('speed')}`
            ]

            await interaction.followUp({
                content: data.join('\n'),
                components: [row]
            });


            const filter = i => (i.customId === 'unregisterYes' && i.user.id === interaction.user.id) || (i.customId === 'unregisterNo' && i.user.id === interaction.user.id);

            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'unregisterNo') {
                    return await i.update({ content: `DB removal aborted!`, components: [] });
                } else if (i.customId === 'unregisterYes') {
                    await i.client.Tags.destroy({
                        where: {
                            name: pokemon.get('name')
                        }
                    });

                    return await i.update({ content: 'The last entry in the DB has been removed!', components: [] });

                }
            });

            collector.on('end', async collected => {
                if (collected.size != 0) return;
                return await interaction.followUp('No input recieved, input buttons are now disabled, if you would like to use this command please re-run the /unregister command!');
            });
            return;

        } catch (error) {
            return console.log(error);
        }
    },
};