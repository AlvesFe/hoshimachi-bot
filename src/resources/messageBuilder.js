// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, Interaction, User } = require('discord.js')
const clientId = process.env.CLIENT_ID

/**
 * Monta o básico de um embed
 * @async
 * @param {Interaction}  interaction O Corpo da Interaction
 * @param {String} title O Título a aparecer no corpo do embed
 * @param {boolean} footer O embed deverá conter rodapé?
 * @returns {Promise<EmbedBuilder>} O embed montado
 */
async function defaultMessage (interaction, title, footer = false) {
  const { botAvatarUrl, botName } = await interaction.client.users.fetch(clientId).then(res => {
    return {
      botAvatarUrl: res.displayAvatarURL({ format: 'png' }),
      botName: res.username
    }
  })
  /** @type {User} */
  const user = await interaction.member.fetch()
  const userAvatarUrl = user.displayAvatarURL({ format: 'png' })

  const message = new EmbedBuilder()
    .setColor(process.env.BOT_COLOR || '#000000')
    .setTitle(title)
    .setAuthor({
      name: botName,
      iconURL: botAvatarUrl
    })
    .setTimestamp()

  if (footer) {
    message
      .setFooter({
        text: user.nickname ?? user.user.username,
        iconURL: userAvatarUrl
      })
  }

  return message
}

module.exports = {
  defaultMessage
}
