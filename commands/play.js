const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

function isVideo (search) {
	return search.type === 'video';
}

async function playMusic (voiceChannel, interaction, url) {
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: interaction.member.guild.voiceAdapterCreator
	});

	const player = createAudioPlayer();
	connection.subscribe(player);

	const stream = ytdl(url, {
		filter: 'audioonly',
		format: 'ogg',
		highWaterMark: 1048576 * 32
	})
		.on('error', (e) => {
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

		if (isVideo(search)) {
			await playMusic(voiceChannel, interaction, search.url);
			await interaction.reply(`Tocando: ${search.title}\n Autor: ${search.author.name}`);
		} else {
			await interaction.reply('Música não encontrada');
		}
	}
};
