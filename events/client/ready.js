

/**
 * Ready event runs when the bot has logged into discord
 * @param {Discord.Client} client 
 */


module.exports = (client) => {
    try {
        console.log('Setting Status');
        (async () => {
            await client.user.setPresence({
                activities: [{ name: "Pokedoodle Bot use / to see commands!" }],
                status: 'online'
            }).then(console.log('Status set!'));
        })();

        client.Tags.sync();

        console.log('Pokedoodle is online');
    } catch (error) {
        console.log(error);
    }
}