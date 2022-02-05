// eslint-disable-next-line no-unused-vars
const { Interaction, User, VoiceChannel } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { getVoiceConnection, AudioPlayer } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

function checkIfUserIsInTheSameChannelOfBot (connection, voiceChannel) {
	return (connection && voiceChannel) && connection.joinConfig.channelId === voiceChannel.id;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passa para a próxima música da fila'),
  /**
   * Executa o comando
   * @param {Interaction} interaction Interaction do comando
   * @returns {void}
   */
  async execute (interaction) {
    /** @type {User} */
		const user = await interaction.member.fetch();
		/** @type {VoiceChannel} */
		const voiceChannel = await user.voice.channel;
		const connection = getVoiceConnection(voiceChannel && voiceChannel.guild.id);
    /** @type {AudioPlayer} */
    const player = connection?.state?.subscription?.player;
    if (checkIfUserIsInTheSameChannelOfBot(connection, voiceChannel) && player) {
      player.stop();
      await interaction.reply('Música pulada');
		} else {
			await interaction.reply({ content: 'Não possível executar este comando', ephemeral: true });
		}
  }
};
