const { EmbedBuilder } = require('discord.js');
const { LEAVE_CHANNEL_MESSAGE } = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {

    const channel = await member.guild.channels.cache.find(
      (channel) => channel.id === LEAVE_CHANNEL_MESSAGE // Hier den Kanalnamen anpassen
    );
    const embed = new EmbedBuilder()
      .setColor('#ff0004') // Farbe des Embeds
      .setTitle('Hat den Server verlassen.')
      .setDescription(`${member.user}, Schade das du uns Verlassen hast. 🎉

        **Discord TAG:** ${member.user}
        **Discord ID:** \`${member.id}\`
        **Discord USERNAME:** \`${member.user.username}\``)
      .setThumbnail(member.user.avatarURL())
  
    channel.send({ embeds: [embed] });
  },
  };
