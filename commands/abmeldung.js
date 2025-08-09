const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Mehrere Rollen als Array
const ALLOWED_ROLE_IDS = ['1403092076769443988']; // Ersetze mit den erlaubten Rollen-IDs
const ALLOWED_CHANNEL_ID = '1403092077671088278'; // Ersetze mit dem erlaubten Channel-ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abmeldung')
        .setDescription('Melde dich ab mit Grund und Länge.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        // Channel-Check
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({ content: 'Du kannst diesen Command nur im erlaubten Channel nutzen.', ephemeral: true });
        }
        // Rollen-Check
        const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLE_IDS.includes(role.id));
        if (!hasRole) {
            return interaction.reply({ content: 'Du hast keine Berechtigung für diesen Command.', ephemeral: true });
        }

        // Button erstellen
        const button = new ButtonBuilder()
            .setCustomId('abmelden_button')
            .setLabel('Abmelden')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(button);

        // Embed für die Button-Nachricht
        const infoEmbed = new EmbedBuilder()
            .setTitle('Abmeldung')
            .setDescription('Klicke auf den Button, um dich abzumelden.')
            .setColor(0xFF0000);

        await interaction.reply({
            embeds: [infoEmbed],
            components: [row],
            ephemeral: false
        });
    },

    // Interaktion für Button und Modal
    async handleInteraction(interaction) {
        if (interaction.isButton() && interaction.customId === 'abmelden_button') {
            // Modal erstellen
            const modal = new ModalBuilder()
                .setCustomId('abmeldung_modal')
                .setTitle('Abmeldung');

            const grundInput = new TextInputBuilder()
                .setCustomId('grund')
                .setLabel('Grund')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const längeInput = new TextInputBuilder()
                .setCustomId('länge')
                .setLabel('Länge')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(grundInput),
                new ActionRowBuilder().addComponents(längeInput)
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'abmeldung_modal') {
            const grund = interaction.fields.getTextInputValue('grund');
            const länge = interaction.fields.getTextInputValue('länge');
            const name = `<@${interaction.user.id}>`;

            const embed = new EmbedBuilder()
                .setTitle('Abmeldung')
                .setColor(0xFF0000)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: 'Name', value: name, inline: false },
                    { name: 'Grund', value: grund, inline: false },
                    { name: 'Länge', value: länge, inline: false }
                )
                .setTimestamp();

            // Button zum Löschen der Abmeldung
            const deleteButton = new ButtonBuilder()
                .setCustomId(`delete_abmeldung_${interaction.user.id}`)
                .setLabel('Abmeldung löschen')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(deleteButton);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
        }

        // Button-Handler für Löschen
        if (interaction.isButton() && interaction.customId.startsWith('delete_abmeldung_')) {
            const abmelderId = interaction.customId.split('_').pop();
            const isAllowedRole = interaction.member.roles.cache.some(role => ALLOWED_ROLE_IDS.includes(role.id));
            const isOwner = interaction.user.id === abmelderId;

            if (isAllowedRole || isOwner) {
                await interaction.message.delete();
            } else {
                await interaction.reply({ content: 'Du darfst diese Abmeldung nicht löschen.', ephemeral: true });
            }
        }
    }
};