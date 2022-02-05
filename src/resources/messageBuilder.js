// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction, User } = require('discord.js');
const clientId = process.env.CLIENT_ID;

/**
 * Monta o básico de um embed
 * @async
 * @param {Interaction}  interaction O Corpo da Interaction
 * @param {String} title O Título a aparecer no corpo do embed
 * @param {boolean} footer O embed deverá conter rodapé?
 * @returns {Promise<MessageEmbed>} O embed montado
 */
async function defaultMessage (interaction, title, footer = false) {
  const { botAvatarUrl, botName } = await interaction.client.users.fetch(clientId).then(res => {
    return {
      botAvatarUrl: res.displayAvatarURL({ format: 'png' }),
      botName: res.username
    };
  });
  /** @type {User} */
  const user = await interaction.member.fetch();
  const userAvatarUrl = user.displayAvatarURL({ format: 'png' });

  const message = new MessageEmbed()
    .setColor('#9ec2e8')
    .setTitle(title)
    .setAuthor(botName, botAvatarUrl)
    .setTimestamp();

  if (footer) {
    message
      .setFooter(user.nickname ?? user.user.username, userAvatarUrl);
  }

  return message;
}

module.exports = {
  defaultMessage
};
