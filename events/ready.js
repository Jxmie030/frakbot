const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity("HOH IST LNV ENDGEGNER", {
            type: ActivityType.Custom,
        })
    }
}
