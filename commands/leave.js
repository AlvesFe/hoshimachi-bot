const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

function checkIfUserIsInTheSameChannelOfBot (connection, voiceChannel) {
	return (connection && voiceChannel) && connection.joinConfig.channelId === voiceChannel.id;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Sai do canal de voz e remove a música'),
	async execute (interaction) {
		const user = await interaction.member.fetch();
		const voiceChannel = await user.voice.channel;
		const connection = getVoiceConnection(voiceChannel.guild.id);

		if (checkIfUserIsInTheSameChannelOfBot(connection, voiceChannel)) {
			connection.destroy();
			await interaction.reply(`Saindo do canal #${voiceChannel.name}`);
		} else {
			await interaction.reply({ content: 'Não possível executar este comando', ephemeral: true });
		}
	},
};