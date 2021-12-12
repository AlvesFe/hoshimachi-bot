const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const { queue } = require('../resources');
const { clientId } = require('../../config.json');

function checkIfUserIsInTheSameChannelOfBot (connection, voiceChannel) {
	return (connection && voiceChannel) && connection.joinConfig.channelId === voiceChannel.id;
}

async function leftTheChannelMessage (interaction, user, voiceChannel) {
	const botAvatarUrl = await interaction.client.users.fetch(clientId).then(res => {
		return res.displayAvatarURL({ format: 'png' });
	});
	const userAvatarUrl = user.displayAvatarURL({ format: 'png' });

	return new MessageEmbed()
		.setColor('#9ec2e8')
		.setAuthor('Hoshimachi', botAvatarUrl, '')
		.setDescription(`Saindo do canal <#${voiceChannel.id}>`)
		.setTimestamp()
		.setFooter(user.nickname ?? user.user.username, userAvatarUrl);
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
			queue.length = 0;
			await interaction.reply({ embeds: [await leftTheChannelMessage(interaction, user, voiceChannel)] });
		} else {
			await interaction.reply({ content: 'Não possível executar este comando', ephemeral: true });
		}
	},
};