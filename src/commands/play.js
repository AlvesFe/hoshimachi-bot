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
			await channel.interaction.followUp({ embeds: [await leftTheChannelMessage(channel.interaction)] });
			getVoiceConnection(channel.interaction.guildId).destroy();
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
 * @returns {void}
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
		const search = (await yts(interaction.options.getString('music'))).all[0];

		if (!voiceChannel) {
			return await interaction.reply('Você precisa estar em um canal de voz para executar esse comando');
		}

		JoinChannel(interaction, voiceChannel);

		if (isVideo(search) && queue.length === 0) {
			queue.push({ search, user });
			await playMusic({ search });
			await interaction.reply({ embeds: [await playingMessage(interaction, search)] });
		} else if (isVideo(search) && queue.length !== 0) {
			queue.push({ search, user });
			await interaction.reply({ embeds: [await addedToQueueMessage(interaction, search)] });
		} else {
			await interaction.reply('Música não encontrada');
		}
	}
};
