const { EmbedBuilder, time } = require('discord.js');
const { WELCOME_CHANNEL_MESSAGE } = require('../config.json');
const { ROLLE_WELCOME_1, ROLLE_WELCOME_2 } = require('../config.json'); // Stelle sicher, dass weitere Rollen hier importiert werden

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Füge hier beliebig viele Rollen-IDs hinzu
    const welcomeRoleIds = [ROLLE_WELCOME_1, ROLLE_WELCOME_2 /*, weitere Rollen-IDs hier */];

    // Versuche, alle Rollen zu finden und hinzuzufügen
    for (const roleId of welcomeRoleIds) {
      const role = member.guild.roles.cache.find(r => r.id == roleId);
      if (role) {
        await member.roles.add(role).catch(console.error);
      }
    }

    const channel = member.guild.channels.cache.find(
      (channel) => channel.id === WELCOME_CHANNEL_MESSAGE
    );
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Willkommen auf dem Server!')
      .setDescription(`Hallo ${member.user}, willkommen auf dem Server! 🎉

        **Discord TAG:** ${member.user}
        **Discord ID:** \`${member.id}\`
        **Discord USERNAME:** \`${member.user.username}\`
        
        **Du bist am** *${new Date(member.joinedTimestamp).toLocaleDateString('de-DE')}* **dem Server beigetreten**`)
      .setThumbnail(member.user.avatarURL())
      .setTimestamp();

    if (channel) {
      channel.send({ embeds: [embed] });
   }
  },
};