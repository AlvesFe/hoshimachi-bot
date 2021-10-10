const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Toca uma música')
		.addStringOption(option =>
			option.setName('music')
				.setDescription('Link ou nome da música')
				.setRequired(true)),
	async execute(interaction) {
		const search = await yts(interaction.options._hoistedOptions[0].value);
		const user = await interaction.member.fetch();
		const voiceChannel = await user.voice.channel;

		if (!voiceChannel) {
			await interaction.reply('Você precisa estar em um canal de voz para executar esse comando');
		} else {
			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: interaction.member.guild.voiceAdapterCreator
			});

			const player = createAudioPlayer();
			connection.subscribe(player);

			const stream = ytdl(search.all[0].url, { filter: 'audioonly' });
			const resource = createAudioResource(stream, { seek: 0, volume: 1 });
			player.play(resource);

			player.on('error', console.error);

			// setTimeout(() => {
			// 	connection.destroy();
			// }, 5000);

			await interaction.reply(`Tocando: ${search.all[0].title}\n Autor: ${search.all[0].author.name}`);
		}
	},
};