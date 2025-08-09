const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');

// IDs anpassen!
const TARGET_ROLE_ID = '1403092076760928415'; // Rolle, deren Reaktionen geprüft werden sollen
const ALLOWED_ROLE_ID = '1403092076769443988'; // Rolle, die den Command ausführen darf

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Checkt die Reaktionen einer Nachricht nach einer festen Rolle.')
        .addStringOption(option =>
            option.setName('nachricht')
                .setDescription('Nachrichten-ID oder Link')
                .setRequired(true)),
    async execute(interaction) {
        // Embed für Fehler
        const errorEmbed = (text) =>
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('❌ Fehler')
                .setDescription(text);

        // Berechtigung prüfen
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return interaction.reply({
                embeds: [errorEmbed('Du hast keine Berechtigung, diesen Befehl auszuführen.')],
                ephemeral: true
            });
        }

        const nachrichtInput = interaction.options.getString('nachricht');
        const rolle = interaction.guild.roles.cache.get(TARGET_ROLE_ID);

        if (!rolle) {
            return interaction.reply({
                embeds: [errorEmbed('Die Zielrolle wurde nicht gefunden.')],
                ephemeral: true
            });
        }

        // Nachricht ID extrahieren
        let messageId;
        let channelId;
        const linkMatch = nachrichtInput.match(/\/channels\/\d+\/(\d+)\/(\d+)/);
        if (linkMatch) {
            channelId = linkMatch[1];
            messageId = linkMatch[2];
        } else {
            messageId = nachrichtInput;
            channelId = interaction.channelId;
        }

        // Nachricht holen
        const channel = await interaction.guild.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                embeds: [errorEmbed('Konnte den Channel nicht finden.')],
                ephemeral: true
            });
        }
        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (!message) {
            return interaction.reply({
                embeds: [errorEmbed('Konnte die Nachricht nicht finden.')],
                ephemeral: true
            });
        }

        // Mitglieder mit Rolle filtern
        await interaction.guild.members.fetch(); // Cache alle Mitglieder
        const membersWithRole = interaction.guild.members.cache.filter(m => m.roles.cache.has(rolle.id));

        // Reaktionen auslesen
        let reacted = {};
        for (const [emoji, reaction] of message.reactions.cache) {
            const users = await reaction.users.fetch();
            reacted[emoji] = users.filter(u => membersWithRole.has(u.id)).map(u => `<@${u.id}>`);
        }

        // Nicht reagiert
        const allReactedIds = Object.values(reacted).flat().map(str => str.replace(/[<@>]/g, ''));
        const notReacted = membersWithRole.filter(m => !allReactedIds.includes(m.id)).map(m => `<@${m.id}>`);

        // Embed für Ergebnis
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle('📊 Reaktions-Check')
            .setDescription(`Nachricht: [Link](${message.url})\nRolle: <@&${rolle.id}>`)
            .addFields(
                {
                    name: 'Reaktionen',
                    value: Object.entries(reacted).map(([emoji, users]) =>
                        `${emoji}: ${users.length ? users.join(' ') : 'Niemand'}`
                    ).join('\n') || 'Keine Reaktionen'
                },
                {
                    name: 'Nicht Reagiert',
                    value: notReacted.length ? notReacted.join(' ') : 'Alle haben reagiert'
                }
            );

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
