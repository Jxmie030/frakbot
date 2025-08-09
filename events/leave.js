const { EmbedBuilder } = require('discord.js');
const { LEAVE_CHANNEL_MESSAGE } = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {

    const channel = await member.guild.channels.cache.find(
      (channel) => channel.id === LEAVE_CHANNEL_MESSAGE
    );

    // Spitzname (Nickname)
    const nickname = member.nickname ? member.nickname : 'Kein Spitzname';

    // Rollen (Roles)
    const roles = member.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => role.toString())
      .join(', ') || 'Keine Rollen';

    const embed = new EmbedBuilder()
      .setColor('#ff0004')
      .setTitle('Hat den Server verlassen.')
      .setDescription(`${member.user}, Schade das du uns Verlassen hast. 🎉

        **Discord TAG:** ${member.user}
        **Discord ID:** \`${member.id}\`
        **Discord USERNAME:** \`${member.user.username}\`
        **Spitzname:** \`${nickname}\`
        **Rollen:** ${roles}`)
      .setThumbnail(member.user.avatarURL());

    channel.send({ embeds: [embed] });
      },
};