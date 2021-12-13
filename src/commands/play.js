const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { queue, channel } = require('../resources');
const player = createAudioPlayer();
const { clientId } = require('../../config.json');

player.on(AudioPlayerStatus.Idle, async () => {
	queue.shift();
	if (queue.length > 0) {
		playMusic(queue[0]);
		await channel.interaction.followUp({ embeds: [await playingMessage(channel.interaction, queue[0].search, queue[0].user)] });
	}
});

function isVideo (search) {
	return search.type === 'video';
}

function JoinChannel (interaction, voiceChannel) {
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: interaction.member.guild.voiceAdapterCreator
	});
	channel.interaction = interaction;
	connection.subscribe(player);
}

async function playMusic ({ search }) {
	const stream = ytdl(search.url, {
		filter: 'audioonly',
		format: 'ogg',
		highWaterMark: 1048576 * 32
	}).on('error', (e) => {
		console.error(e);
	});

	const resource = createAudioResource(stream, { seek: 0, volume: 1 });
	player.play(resource);
}

async function playingMessage (interaction, search, user) {
	const botAvatarUrl = await interaction.client.users.fetch(clientId).then(res => {
		return res.displayAvatarURL({ format: 'png' });
	});
	const userAvatarUrl = user.displayAvatarURL({ format: 'png' });

	return new MessageEmbed()
		.setColor('#9ec2e8')
		.setTitle(search.title)
		.setURL(search.url)
		.setAuthor('Hoshimachi', botAvatarUrl, '')
		.setDescription(search.description)
		.setThumbnail(search.thumbnail)
		.addFields(
			{ name: 'Autor', value: search.author.name },
		)
		.setTimestamp()
		.setFooter(user.nickname ?? user.user.username, userAvatarUrl);
}

async function addedToQueueMessage (interaction, search, user) {
	const botAvatarUrl = await interaction.client.users.fetch(clientId).then(res => {
		return res.displayAvatarURL({ format: 'png' });
	});
	const userAvatarUrl = user.displayAvatarURL({ format: 'png' });

	return new MessageEmbed()
		.setColor('#9ec2e8')
		.setTitle(search.title)
		.setURL(search.url)
		.setAuthor('Hoshimachi', botAvatarUrl, '')
		.setDescription('Música adicionada a fila!')
		.setThumbnail(search.thumbnail)
		.setTimestamp()
		.setFooter(user.nickname ?? user.user.username, userAvatarUrl);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Toca uma música')
		.addStringOption(option =>
			option.setName('music')
				.setDescription('Link ou nome da música')
				.setRequired(true)),
	async execute (interaction) {
		const user = await interaction.member.fetch();
		const voiceChannel = await user.voice.channel;
		const search = (await yts(interaction.options.getString('music'))).all[0];

		if (!voiceChannel) {
			return await interaction.reply('Você precisa estar em um canal de voz para executar esse comando');
		}

		JoinChannel(interaction, voiceChannel);

		if (isVideo(search) && queue.length === 0) {
			queue.push({ search, user });
			await playMusic({ search });
			await interaction.reply({ embeds: [await playingMessage(interaction, search, user)] });
		} else if (isVideo(search) && queue.length !== 0) {
			queue.push({ search, user });
			await interaction.reply({ embeds: [await addedToQueueMessage(interaction, search, user)] });
		} else {
			await interaction.reply('Música não encontrada');
		}
	}
};
