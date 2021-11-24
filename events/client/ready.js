

/**
 * Ready event runs when the bot has logged into discord
 * @param {Discord.Client} client 
 */


module.exports = (client) => {
    try {
        console.log('Syncing DB');

        client.Tags.sync();

        console.log('Setting Status');

        let statusIndex = 0;

        client.globalInterval = setInterval(async () => {
            const pokemon = await client.Tags.findOne({
                order: [['id', 'DESC']],
            }).then(data => {
                return {
                    id: data.get('id'),
                    dexNumber: data.get('dexNumber')
                }
            }).catch(err => {
                console.log(err);
            });

            const statusArray = [
                'Pokedoodle Bot!',
                'Type / to see all commands!',
                '/invite to add this bot to your own server',
                `Their is currently: ${pokemon.dexNumber} pokemon recorded!`,
                `Their are currently: ${pokemon.id} different poke-forms recorded!`
            ]

            await client.user.setPresence({
                activities: [{ name: statusArray[statusIndex] }],
                status: 'online'
            });
            statusIndex += 1;
            if (statusIndex === statusArray.length) {
                statusIndex = 0;
            }
        }, 10000);

        console.log('Status set!');


        console.log('Pokedoodle is online');
    } catch (error) {
        console.log(error);
    }
}