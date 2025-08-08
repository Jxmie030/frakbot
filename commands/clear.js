const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CLEAR_ALLOWED_ROLES } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht Nachrichten im Chat.')
        .addStringOption(option =>
            option.setName('modus')
                .setDescription('Wähle, ob du eine Menge oder alles löschen willst.')
                .setRequired(true)
                .addChoices(
                    { name: 'Menge', value: 'menge' },
                    { name: 'Alles', value: 'alles' }
                )
        )
        .addIntegerOption(option =>
            option.setName('anzahl')
                .setDescription('Wie viele Nachrichten sollen gelöscht werden? (2-100)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        // Rollen-Check
        if (!interaction.member.roles.cache.some(role => CLEAR_ALLOWED_ROLES.includes(role.id))) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl zu nutzen.', ephemeral: true });
        }

        const modus = interaction.options.getString('modus');
        const anzahl = interaction.options.getInteger('anzahl');

        if (modus === 'menge') {
            if (!anzahl || anzahl < 2 || anzahl > 100) {
                return interaction.reply({ content: 'Bitte gib eine Anzahl zwischen 2 und 100 an.', ephemeral: true });
            }
            await interaction.channel.bulkDelete(anzahl, true);
            await interaction.reply({ content: `✅ ${anzahl} Nachrichten wurden gelöscht.`, ephemeral: true });
        } else if (modus === 'alles') {
            let deleted = 0;
            let fetched;
            do {
                fetched = await interaction.channel.bulkDelete(100, true);
                deleted += fetched.size;
            } while (fetched.size >= 2);
            await interaction.reply({ content: `✅ Alle möglichen Nachrichten (${deleted}) wurden gelöscht.`, ephemeral: true });
        }
    }
};