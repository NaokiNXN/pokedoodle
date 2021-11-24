

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
            const id = await client.Tags.findAll({
                order: [['id', 'DESC']],
            }).then(data => {
                return data.length
            }).catch(err => {
                console.log(err);
            });


            const dexNumber = await client.Tags.findAll({
                order: [['dexNumber', 'DESC']],
            }).then(data => {
                let count = 0;
                let lastDex = 0;
                for (const element of data) {
                    if (element.get('dexNumber') != lastDex) {
                        count += 1;
                        lastDex = element.get('dexNumber');
                    };
                };
                return count;
            }).catch(err => {
                console.log(err);
            });

            const statusArray = [
                'Pokedoodle Bot!',
                `Currently connected to: ${client.guilds.cache.length} guilds`,
                'Type / to see all commands!',
                '/invite to add this bot to your own server',
                `Their is currently: ${dexNumber} pokemon recorded!`,
                `Their are currently: ${id} different poke-forms recorded!`
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