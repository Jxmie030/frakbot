const { SlashCommandBuilder } = require('discord.js');
const { 
    L12_ROLE_ID_MITGLIEDERLISTE, L11_ROLE_ID_MITGLIEDERLISTE, L10_ROLE_ID_MITGLIEDERLISTE, 
    L9_ROLE_ID_MITGLIEDERLISTE, MITGLIEDER_ROLE_ID_MITGLIEDERLISTE, CALLER_ROLE_ID_MITGLIEDERLISTE, 
    BACKSTEP_ROLE_ID_MITGLIEDERLISTE, HELI_ROLE_ID_MITGLIEDERLISTE, SERVERID, 
    MITGLIEDERLISTECHANNELID, MITGLIEDERLISTETEXT 
} = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Aktualisiert die Mitgliederliste im Channel.'),
    async execute(interaction) {
        const guild = await interaction.client.guilds.fetch(SERVERID);
        const channel = await guild.channels.fetch(MITGLIEDERLISTECHANNELID);

        const ROLES = [
            { name: 'Rang 12', id: L12_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Rang 11', id: L11_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Rang 10', id: L10_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Rang 9', id: L9_ROLE_ID_MITGLIEDERLISTE },
            { name: 'MITGLIEDER', id: MITGLIEDER_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Caller', id: CALLER_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Backstep', id: BACKSTEP_ROLE_ID_MITGLIEDERLISTE },
            { name: 'Heli', id: HELI_ROLE_ID_MITGLIEDERLISTE }
        ];

        const embed = new EmbedBuilder()
            .setTitle(MITGLIEDERLISTETEXT)
            .setColor(0x3498db)
            .setTimestamp();

        // Cache alle Mitglieder, damit alle angezeigt werden
        await guild.members.fetch();

        for (const roleData of ROLES) {
            const role = await guild.roles.fetch(roleData.id);
            if (!role) continue;
            // Filtere alle Mitglieder nach Rolle
            const members = guild.members.cache
                .filter(member => member.roles.cache.has(role.id))
                .map(m => `<@${m.id}>`)
                .join('\n') || 'Keine Mitglieder.';
            embed.addFields({ name: `🔹 ${roleData.name}`, value: members, inline: false });
        }

        // Nur die letzte Bot-Nachricht bearbeiten
        const messages = await channel.messages.fetch({ limit: 10 });
        const lastBotMessage = messages.find(msg => msg.author.id === interaction.client.user.id);

        if (!lastBotMessage) {
            await channel.send({ embeds: [embed] });
        } else {
            await lastBotMessage.edit({ embeds: [embed] });
        }

        await interaction.reply({ content: 'Mitgliederliste wurde aktualisiert!', ephemeral: true });
    }
};