const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientID, guildID, token } = require('./config.json');

function getFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let commandFiles = [];
    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(path.join(dir, file.name))
            ];
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(path.join(dir, file.name));
        }
    }
    return commandFiles;
}

const commands = [];
const commandFiles = getFiles(path.join(__dirname, 'commands'));

for (const file of commandFiles) {
    const command = require(file);
    if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Starte das Registrieren von ${commands.length} Slash Commands...`);
        await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands }
        );
        console.log('Alle Slash Commands wurden erfolgreich registriert!');
    } catch (error) {
        console.error(error);
    }
})();