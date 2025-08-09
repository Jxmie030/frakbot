const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const ALLOWED_ROLE_ID = '1403092076769443988';
const LOG_CHANNEL_ID = '1403456421797826580'; // Deine Log-Channel-ID

async function sendLog(interaction, message, color = 0x5865F2) {
    const logChannel = await interaction.guild.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel && logChannel.isTextBased()) {
        const logEmbed = new EmbedBuilder()
            .setTitle('Log')
            .setDescription(message)
            .setColor(color)
            .setTimestamp();
        logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Bezahle eine Sanktion.')
        .addStringOption(option =>
            option.setName('nachrichtid')
                .setDescription('Nachrichten-ID der Sanktion')
                .setRequired(true)),
    async execute(interaction) {
        await sendLog(interaction, `[PAY COMMAND] User: ${interaction.user.tag} (${interaction.user.id}) used /pay`);

        // Rollenprüfung
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
            await sendLog(interaction, `[PAY COMMAND] User ${interaction.user.tag} (${interaction.user.id}) does not have required role.`, 0xFFAA00);
            return interaction.reply({ content: 'Du hast keine Berechtigung, diese Sanktion zu bezahlen.', ephemeral: true });
        }

        const nachrichtId = interaction.options.getString('nachrichtid');
        try {
            const msg = await interaction.channel.messages.fetch(nachrichtId);
            if (!msg) {
                await sendLog(interaction, `[PAY COMMAND] Nachricht mit ID ${nachrichtId} nicht gefunden.`, 0xFFAA00);
                return interaction.reply({ content: 'Nachricht nicht gefunden.', ephemeral: true });
            }

            // Hole das ursprüngliche Embed und bearbeite es
            const oldEmbed = msg.embeds[0];
            if (!oldEmbed) {
                await sendLog(interaction, `[PAY COMMAND] Kein Embed in Nachricht ${nachrichtId} gefunden.`, 0xFFAA00);
                return interaction.reply({ content: 'Kein Embed in der Nachricht gefunden.', ephemeral: true });
            }

            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setColor(0x00FF00)
                .setTitle('Sanktion bezahlt')
                .setDescription(`${oldEmbed.description}\n\n✅ Bezahlt am: <t:${Math.floor(Date.now()/1000)}:f>`);

            await msg.edit({ embeds: [newEmbed] });
            await sendLog(interaction, `[PAY COMMAND] Nachricht ${nachrichtId} als bezahlt markiert.`, 0x00FF00);

            await interaction.reply({ content: 'Sanktion wurde als bezahlt markiert.', ephemeral: true });

            setTimeout(async () => {
                await msg.delete().catch(() => {});
                await sendLog(interaction, `[PAY COMMAND] Nachricht ${nachrichtId} nach 24h gelöscht.`, 0x808080);
            }, 24 * 60 * 60 * 1000);
        } catch (err) {
            await sendLog(interaction, `[PAY COMMAND] Fehler: ${err}`, 0xFF0000);
            return interaction.reply({ content: 'Fehler beim Bearbeiten der Nachricht.', ephemeral: true });
        }
    }
};