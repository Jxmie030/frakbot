const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID } = require('../config.json');
const { ALLOWED_KICK_ROLES } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicke ein Mitglied vom Server und logge den Grund.')
        .addUserOption(option =>
            option.setName('mitglied')
                .setDescription('Das zu kickende Mitglied')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Der Grund für den Kick')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        // Rollen-Check
        if (!interaction.member.roles.cache.some(role => ALLOWED_KICK_ROLES.includes(role.id))) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        const member = interaction.options.getMember('mitglied');
        const reason = interaction.options.getString('grund');

        if (!member) {
            return interaction.reply({ content: 'Mitglied nicht gefunden.', ephemeral: true });
        }
        if (!member.kickable) {
            return interaction.reply({ content: 'Ich kann dieses Mitglied nicht kicken.', ephemeral: true });
        }

        await member.kick(reason);

        await interaction.reply({ content: `✅ <@${member.id}> wurde gekickt.\n**Grund:** ${reason}`, ephemeral: true });

        // Log ins Log-Channel
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🚫 Mitglied gekickt')
                .addFields(
                    { name: 'Mitglied', value: `<@${member.id}> (${member.user.tag})`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: 'Grund', value: reason, inline: false }
                )
                .setTimestamp()
                .setColor(0xff0000);
            await logChannel.send({ embeds: [embed] });
        }
    }
};