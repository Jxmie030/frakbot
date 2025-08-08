const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const { FUNK_CHANNEL } = require('../config.json');
const { FUNK_CMD_ROLE } = require('../config.json');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('funk')
        .setDescription('Sende eine Funk-Nachricht in einen bestimmten Channel')
        .addStringOption(option =>
            option.setName('nachricht')
                .setDescription('Die Nachricht, die gesendet werden soll')
                .setRequired(true)
        ),
    async execute(interaction) {
        const allowedRoleId = config.FUNK_CMD_ROLE; 
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: 'Du hast keine Berechtigung für diesen Befehl.', ephemeral: true });
        }

        const nachricht = interaction.options.getString('nachricht');
        const channelId = config.FUNK_CHANNEL;
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply({ content: 'Channel nicht gefunden!', ephemeral: true });
        }

        // Nachricht als normalen Text senden
        await channel.send(`**NEUER FUNK**\n${nachricht}\n_Gesendet von: ${interaction.user}_`);
        await interaction.reply({ content: 'Funk-Nachricht wurde gesendet!', ephemeral: true });
    }
};