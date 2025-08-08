const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { UNBAN_ALLOWED_ROLES } = require('../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Entbannt einen Benutzer mit Grund.')
        .addUserOption(option =>
            option.setName('userid')
                .setDescription('Die ID des zu entbannenden Benutzers')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Grund für den Unban')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userId = interaction.options.getUser('userid');
        const grund = interaction.options.getString('grund');

        // Prüfe, ob der Command-User eine erlaubte Rolle hat
        const authorMember = await interaction.guild.members.fetch(interaction.user.id);
        const hasRole = authorMember.roles.cache.some(role => UNBAN_ALLOWED_ROLES.includes(role.id));
        if (!hasRole) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(userId, grund);

            // Embed für die Antwort
            const replyEmbed = new EmbedBuilder()
                .setTitle('✅ Benutzer entbannt')
                .addFields(
                    { name: 'Benutzer-ID', value: `${userId}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user}`, inline: true },
                    { name: 'Grund', value: grund, inline: false }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [replyEmbed] });

            // Embed für das Log
            const logEmbed = new EmbedBuilder()
                .setTitle('✅ Unban-Log')
                .addFields(
                    { name: 'Benutzer-ID', value: `${userId}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user}`, inline: true },
                    { name: 'Grund', value: grund, inline: false }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'ban-logs');
            if (logChannel) {
                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            await interaction.reply({ content: `❌ Fehler beim Entbannen: ${error.message}`, ephemeral: true });
        }
    }
};