const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const ALLOWED_ROLE_ID = '1403092076769443988';
const LOG_CHANNEL_ID = '1403456421797826580'; // Log-Channel-ID

async function sendLog(interaction, title, description, color = 0x5865F2) {
    const logChannel = await interaction.guild.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel && logChannel.isTextBased()) {
        const logEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
        logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sanktion')
        .setDescription('Verhänge eine Sanktion gegen einen User.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der zu sanktionierende User')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hoehe')
                .setDescription('Höhe der Sanktion')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Grund der Sanktion')
                .setRequired(true)),
    async execute(interaction) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
            await sendLog(
                interaction,
                'Sanktion Versuch',
                `User ${interaction.user.tag} (${interaction.user.id}) wollte Sanktion ausstellen, aber hat keine Berechtigung.`,
                0xFFAA00
            );
            return interaction.reply({ content: 'Du hast keine Berechtigung, Sanktionen auszustellen.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const hoehe = interaction.options.getInteger('hoehe');
        const grund = interaction.options.getString('grund');

        await sendLog(
            interaction,
            'Sanktion Ausgestellt',
            `User ${interaction.user.tag} (${interaction.user.id}) hat Sanktion gegen ${user.tag} (${user.id}) ausgesprochen.\n**Höhe:** ${hoehe}\n**Grund:** ${grund}`,
            0xFF0000
        );

        const embed = new EmbedBuilder()
            .setTitle('Sanktion')
            .setDescription(`**${user}** wurde sanktioniert!\n\n**Höhe:** ${hoehe}\n**Grund:** ${grund}`)
            .setColor(0xFF0000)
            .setTimestamp();

        const msg = await interaction.reply({
            content: `${user}`,
            embeds: [embed],
            fetchReply: false
        });

        setTimeout(() => {
            interaction.channel.messages.delete(msg.id).catch(() => {});
            sendLog(
                interaction,
                'Sanktion Nachricht gelöscht',
                `Sanktion-Nachricht für ${user.tag} (${user.id}) nach 24h gelöscht.`,
                0x808080
            );
        }, 24 * 60 * 60 * 1000);
    }
};