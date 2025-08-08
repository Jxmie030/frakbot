const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { BAN_ALLOWED_ROLES } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt einen Benutzer mit Grund.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der zu bannende Benutzer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Grund für den Bann')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const grund = interaction.options.getString('grund');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const authorMember = await interaction.guild.members.fetch(interaction.user.id);
        const hasRole = authorMember.roles.cache.some(role => BAN_ALLOWED_ROLES.includes(role.id));
        if (!hasRole) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }
        if (!member.bannable) {
            return interaction.reply({ content: 'Ich kann diesen Benutzer nicht bannen.', ephemeral: true });
        }

        // DM an den Benutzer vor dem Bann
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('Du wurdest gebannt')
                .setDescription(`Du wurdest von **${interaction.guild.name}** gebannt.`)
                .addFields(
                    { name: 'Grund', value: grund },
                    { name: 'Moderator', value: `${interaction.user}` }
                )
                .setColor(0xff0000)
                .setTimestamp();
            await user.send({ embeds: [dmEmbed] });
        } catch (err) {
            // DM konnte nicht gesendet werden (z.B. DMs deaktiviert)
        }

        await member.ban({ reason: grund });

        // Embed für die Antwort
        const replyEmbed = new EmbedBuilder()
            .setTitle('🔨 Benutzer gebannt')
            .addFields(
                { name: 'Benutzer', value: `${user} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user}`, inline: true },
                { name: 'Grund', value: grund, inline: false }
            )
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [replyEmbed] });

        // Embed für das Log
        const logEmbed = new EmbedBuilder()
            .setTitle('🔨 Bann-Log')
            .addFields(
                { name: 'Benutzer', value: `${user} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user}`, inline: true },
                { name: 'Grund', value: grund, inline: false }
            )
            .setColor(0xff0000)
            .setTimestamp();

        const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'ban-logs');
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }
    }
};