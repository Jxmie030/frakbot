const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = getCommands('./commands');
const abmeldungCommand = require('../commands/abmeldung.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Slash Commands
        if (interaction.isChatInputCommand()) {
            let command = client.commands.get(interaction.commandName);
            try {
                if (interaction.replied) return;
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
            return;
        }

        // Abmeldung Button/Modal
if (interaction.isButton() || interaction.isModalSubmit()) {
        // Hole das passende Command-Objekt
        const command = client.commands.get('abmeldung');
        if (command && command.handleInteraction) {
            await command.handleInteraction(interaction);
        }
    }
    }
};


function getCommands(dir) {
    let commands = new Collection();
    const commandFiles = getFiles(dir);

    for(const commandFile of commandFiles) {
        let command = require("."+commandFile);
        commands.set(command.data.toJSON(). name, command)
    }
    return commands;
}

function getFiles(dir){
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });
    let commandFiles = [];

    for(const file of files) {
        if(file.isDirectory()){
            commandFiles = [
            ...commandFiles,
            ...getFiles(`${dir}/${file.name}`)
            ]
        } else if (file.name.endsWith(".js")) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
    return commandFiles;
}
