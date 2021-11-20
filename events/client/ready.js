

/**
 * Ready event runs when the bot has logged into discord
 * @param {Discord.Client} client 
 */


module.exports = (client) => {
    console.log('Setting Status');
    try {
        await client.user.setPresence({
            activities: [{ name: "Pokedoodle Bot use / to see commands!" }],
            status: 'online'
        });
    } catch (error) {
        console.log(error);
    }
    console.log('Pokedoodle is online');
}