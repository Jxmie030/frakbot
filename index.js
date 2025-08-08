const { token } = require('./config.json');
const { Client, Events, GatewayIntentBits, SlashCommandBuilder, Embed, EmbedBuilder, Collection, Role, RoleFlags, ActivityType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path')
const config = require('./config.json');
const token = process.env.DISCORD_TOKEN;
require('dotenv').config();


const client = new Client({ intents: [GatewayIntentBits.Guilds] | [GatewayIntentBits.GuildMembers] | [GatewayIntentBits.MessageContent] | [GatewayIntentBits.GuildMessages]});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter (file => file.endsWith('.js'));

for(const file of eventFiles){
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('ready', () => {
    console.log('Ready')
})

client.login(token);