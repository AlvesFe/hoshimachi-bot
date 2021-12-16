import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { MessageEmbed, VoiceChannel } from 'discord.js'
import { ConfigChannel } from '../resources';
import { clientId } from '../../config.json'

const { queue } = ConfigChannel;

function checkIfUserIsInTheSameChannelOfBot (connection: any, voiceChannel: VoiceChannel) {
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
		const connection = getVoiceConnection(voiceChannel && voiceChannel.guild.id);

		if (checkIfUserIsInTheSameChannelOfBot(connection, voiceChannel)) {
			connection.destroy();
			queue.length = 0;
			await interaction.reply({ embeds: [await leftTheChannelMessage(interaction, user, voiceChannel)] });
		} else {
			await interaction.reply({ content: 'Não possível executar este comando', ephemeral: true });
		}
	},
};