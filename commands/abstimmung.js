const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ALLOWED_ROLES_ABSTIMMUNG } = require('../config.json');
// Ersetze dies durch die IDs der Rollen, die den Befehl nutzen dürfen
module.exports = {
    data: new SlashCommandBuilder()
        .setName('abstimmung')
        .setDescription('Erstellt eine Abstimmung mit Ping an eine bestimmte Rolle.')
        .addStringOption(option =>
            option.setName('frage')
                .setDescription('Die Frage für die Abstimmung')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rolle')
                .setDescription('Die zu pingende Rolle')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('bild')
                .setDescription('Optional: Link zu einem Bild für die Abstimmung')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        // Rollen-Check
        if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES_ABSTIMMUNG.includes(role.id))) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        const frage = interaction.options.getString('frage');
        const rolle = interaction.options.getRole('rolle');
        const bild = interaction.options.getString('bild');

        const embed = new EmbedBuilder()
            .setTitle('📊 Neue Abstimmung')
            .setDescription(frage)
            .setColor(0x3498db)
            .setFooter({ text: `Gestartet von ${interaction.user.tag}` })
            .setTimestamp();

        if (bild) {
            embed.setImage(bild);
        }

        // Sende die Abstimmung und pinge die Rolle
        const message = await interaction.reply({
            content: `${rolle}`,
            embeds: [embed],
            fetchReply: true
        });

        // Füge Reaktionen für Ja und Nein hinzu
        await message.react('✅');
        await message.react('❌');
    }
};