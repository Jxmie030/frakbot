const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('HOH IST ENDGEGNER VON LNV', { type: Discord.ActivityType.Competing });)
    }
}
