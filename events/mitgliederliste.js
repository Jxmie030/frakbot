const { Events, EmbedBuilder } = require('discord.js');
const { L12_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { L11_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { L10_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { MITGLIEDER_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { BACKSTEP_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { CALLER_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { HELI_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');
const { SERVERID } = require('../config.json');
const { MITGLIEDERLISTECHANNELID } = require('../config.json');
const { MITGLIEDERLISTETEXT } = require('../config.json'); 
const { L9_ROLE_ID_MITGLIEDERLISTE } = require('../config.json');


module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const GUILD_ID = SERVERID; // Server-ID
        const CHANNEL_ID = MITGLIEDERLISTECHANNELID; // Channel-ID

        // Rollen-IDs mit Namen
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

        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = await guild.channels.fetch(CHANNEL_ID);
        if (!guild || !channel) return;

        let sentMessage;

        const updateTeamList = async () => {
            const embed = new EmbedBuilder()
                .setTitle(MITGLIEDERLISTETEXT)
                .setColor(0x3498db)
                .setTimestamp();

            for (const roleData of ROLES) {
                const role = await guild.roles.fetch(roleData.id);
                if (!role) continue;

                const members = role.members.map(m => `<@${m.id}>`).join('\n') || 'Keine Mitglieder.';
                embed.addFields({ name: `🔹 ${roleData.name}`, value: members, inline: false });
            }

            if (!sentMessage) {
                sentMessage = await channel.send({ embeds: [embed] });
            } else {
                await sentMessage.edit({ embeds: [embed] });
            }
        };

        updateTeamList();
        setInterval(updateTeamList, 10_000);
    }
};
