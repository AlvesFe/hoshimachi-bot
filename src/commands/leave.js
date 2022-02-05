const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const { queue } = require('../resources');
const { defaultMessage } = require('../resources/messageBuilder');

function checkIfUserIsInTheSameChannelOfBot (connection, voiceChannel) {
	return (connection && voiceChannel) && connection.joinConfig.channelId === voiceChannel.id;
}

async function leftTheChannelMessage (interaction, voiceChannel) {
	const message = (await defaultMessage(interaction, 'Desconectado', true))
		.setDescription(`Saindo do canal <#${voiceChannel.id}>`);
	return message;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Sai do canal de voz e remove a música'),
	async execute (interaction) {
		const user = await interaction.member.fetch();
		const voiceChannel = await user.voice.channel;
		const connection = getVoiceConnection(voiceChannel && voiceChannel.guild.id);

		if (checkIfUserIsInTheSameChannelOfBot(connection, voiceChannel)) {
			connection.destroy();
			queue.length = 0;
			await interaction.reply({ embeds: [await leftTheChannelMessage(interaction, voiceChannel)] });
		} else {
			await interaction.reply({ content: 'Não possível executar este comando', ephemeral: true });
		}
	},
};