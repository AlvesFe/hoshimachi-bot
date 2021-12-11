const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { queue, channel } = require('../resources');
const player = createAudioPlayer();

player.on(AudioPlayerStatus.Idle, async () => {
	queue.shift();
	if (queue.length > 0) {
		playMusic(queue[0]);
		await channel.interaction.followUp(`Tocando: ${queue[0].title}\n Autor: ${queue[0].author.name}`);
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

async function playMusic (search) {
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
		const search = (await yts(interaction.options._hoistedOptions[0].value)).all[0];

		if (!voiceChannel) {
			return await interaction.reply('Você precisa estar em um canal de voz para executar esse comando');
		}

		JoinChannel(interaction, voiceChannel);

		if (isVideo(search) && queue.length === 0) {
			queue.push(search);
			await playMusic(search);
			await interaction.reply(`Tocando: ${search.title}\n Autor: ${search.author.name}`);
		} else if (isVideo(search) && queue.length !== 0) {
			queue.push(search);
			await interaction.reply(`Música ${queue[queue.length - 1].title} adicionada a fila`);
		} else {
			await interaction.reply('Música não encontrada');
		}
	}
};
