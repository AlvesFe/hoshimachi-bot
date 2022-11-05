// eslint-disable-next-line no-unused-vars
const { Interaction, VoiceChannel } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { queue, channel } = require('../resources');
const { defaultMessage } = require('../resources/messageBuilder');
const player = createAudioPlayer();

player.on(AudioPlayerStatus.Idle, async () => {
	queue.shift();
	if (queue.length > 0) {
		playMusic(queue[0]);
		await channel.interaction.followUp({ embeds: [await playingMessage(channel.interaction, queue[0].search, queue[0].user)] });
	} else {
		player.stop();
		setTimeout(async () => {
			if (queue.length === 0) {
				await channel.interaction.followUp({ embeds: [await leftTheChannelMessage(channel.interaction)] });
				getVoiceConnection(channel.interaction.guildId).destroy();
			}
		}, 10000);
	}
});

/**
 * Verifica se o primeiro resultado retornado na busca do yt é um vídeo
 * @param {yts.VideoSearchResult} search O Primeiro resultado retornado na busca no yt
 * @returns {boolean} Booleano para se o retorno é um vídeo
 */
function isVideo (search) {
	return search?.type === 'video';
}

/**
 * Faz o bot se conectar no canal onde o usuário chamou o comando
 * @param {Interaction} interaction Interaction do comando
 * @param {VoiceChannel} voiceChannel Canal de voz que o usuário que chamou o comando está
 * @returns {void}
 */
function JoinChannel (interaction, voiceChannel) {
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: interaction.member.guild.voiceAdapterCreator
	});
	channel.interaction = interaction;
	connection.subscribe(player);
}

/**
 * Inicia uma música no bot
 * @param {{ search: yts.VideoSearchResult }} queueItem
 * @returns {Promise<void>}
 */
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

/**
 * Monta um embed para quando uma música começa a tocar
 * @param {Interaction} interaction Interaction do comando
 * @returns Mensagem montada
 */
async function playingMessage (interaction, search) {
	const message = (await defaultMessage(interaction, search.title, true))
		.setURL(search.url)
		.setDescription(search.description)
		.setThumbnail(search.thumbnail)
		.addFields(
			{ name: '**Autor:** ', value: search.author.name },
		);
	return message;
}

async function playlistMessage (interaction, title, thumbnail, playlist) {
	const fields = [];

	const loopLength = playlist.length > 5 ? 5 : playlist.length;
	for (let i = 0; i < loopLength; i++) {
		fields.push({
			name: playlist[i].search.title,
			value: `\` ${i + 1} \` • ${playlist[i].search.author.name} • ${playlist[i].search.duration.timestamp}`
		});
	}

	loopLength > 5 && fields.push({
		name: `...e mais ${playlist.length - loopLength} músicas!`,
		value: '\u200b'
	});

	const message = (await defaultMessage(
		interaction,
		`Playlist ${title} adicionada à fila`,
		true
	)).setDescription('Adicionando...')
		.setThumbnail(thumbnail)
		.addFields([...fields]);

	return message;
}

/**
 * Monta um embed para quando uma música é adicionada na fila
 * @param {Interaction} interaction Interaction do comando
 * @returns Mensagem montada
 */
async function addedToQueueMessage (interaction, search) {
	const message = (await defaultMessage(interaction, search.title, true))
		.setURL(search.url)
		.setDescription('Música adicionada a fila!')
		.setThumbnail(search.thumbnail);
	return message;
}

/**
 * Monta um embed para quando o bot sai do canal por inatividade
 * @param {Interaction} interaction Interaction do comando
 * @returns Mensagem montada
 */
async function leftTheChannelMessage (interaction) {
	const message = (await defaultMessage(interaction, 'Desconectado'))
		.setDescription('Saindo do canal por inatividade');

	return message;
}

function formatMusicString (search) {
	try {
		const url = new URL(search);

		const urlParams = new URLSearchParams(url.search);
		const listId = urlParams.get('list');

		return (listId ? { listId } : { query: search });
	} catch {
		return { query: search };
	}
}

function formatPlaylist (playlist, user) {
	return playlist.videos.map((video, index) => {
		return {
			search: {
				...video,
				url: video.url ?? `https://youtube.com/watch?v=${video.videoId}`,
				description: `Música ${index + 1} da playlist ${playlist.title}`
			},
			user
		};
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Toca uma música')
		.addStringOption(option =>
			option.setName('music')
				.setDescription('Link ou nome da música')
				.setRequired(true)),
	/**
	 * Executa o comando
	 * @param {Interaction} interaction Interaction do comando
	 * @returns {void}
	 */
	async execute (interaction) {
		const user = await interaction.member.fetch();
		const voiceChannel = await user.voice.channel;

		if (!voiceChannel) {
			return await interaction.reply('Você precisa estar em um canal de voz para executar esse comando');
		}
		const musicStrings = formatMusicString(interaction.options.getString('music'));
		const response = await yts(musicStrings);

		if (!response.all) {
			const playlist = formatPlaylist(response, user);
			JoinChannel(interaction, voiceChannel);
			if (queue.length === 0) await playMusic({ search: playlist[0].search });
			queue.push(...playlist);
			return await interaction.reply({ embeds: [await playlistMessage(interaction, response.title, response.thumbnail, playlist)] });
		}

		const search = response.all[0];
		if (!isVideo(search)) return await interaction.reply('Música não encontrada');

		JoinChannel(interaction, voiceChannel);
		if (queue.length === 0) await playMusic({ search });
		queue.push({ search, user });
		const embeds = queue.length === 0
		? playingMessage(interaction, search)
		: addedToQueueMessage(interaction, search);

		await interaction.reply({ embeds: [await embeds] });
	}
};
